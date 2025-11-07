import mongoose from 'mongoose';
import Booking, { IBooking } from '@/database/booking.model';
import Event from '@/database/event.model';
import { connect, closeDatabase, clearDatabase, clearModels } from '../test-utils';

describe('Booking Model', () => {
  let testEventId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    clearModels();
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test event for bookings
    const event = new Event({
      title: 'Test Event for Bookings',
      description: 'A test event',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '10:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Test Organizer',
      tags: ['test'],
    });
    const savedEvent = await event.save();
    testEventId = savedEvent._id as mongoose.Types.ObjectId;
  });

  describe('Schema Validation', () => {
    it('should create and save a booking successfully with valid data', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.eventId).toEqual(testEventId);
      expect(savedBooking.email).toBe('test@example.com');
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
    });

    it('should fail validation when eventId is missing', async () => {
      const booking = new Booking({
        email: 'test@example.com',
      });
      
      await expect(booking.save()).rejects.toThrow('Event ID is required');
    });

    it('should fail validation when email is missing', async () => {
      const booking = new Booking({
        eventId: testEventId,
      });
      
      await expect(booking.save()).rejects.toThrow('Email is required');
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        '123@example.com',
      ];

      for (const email of validEmails) {
        const booking = new Booking({
          eventId: testEventId,
          email: email,
        });
        const savedBooking = await booking.save();
        expect(savedBooking.email).toBe(email.toLowerCase());
        await Booking.deleteOne({ _id: savedBooking._id });
      }
    });

    it('should reject invalid email addresses', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        'user@domain',
        'user..name@example.com',
      ];

      for (const email of invalidEmails) {
        const booking = new Booking({
          eventId: testEventId,
          email: email,
        });
        await expect(booking.save()).rejects.toThrow('Please provide a valid email address');
      }
    });

    it('should convert email to lowercase', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'TEST@EXAMPLE.COM',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('test@example.com');
    });

    it('should trim whitespace from email', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: '  test@example.com  ',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('test@example.com');
    });

    it('should fail when email exceeds 254 characters', async () => {
      const longEmail = 'a'.repeat(240) + '@example.com'; // Total > 254
      const booking = new Booking({
        eventId: testEventId,
        email: longEmail,
      });
      
      await expect(booking.save()).rejects.toThrow('Email cannot exceed 254 characters');
    });

    it('should succeed when email is exactly 254 characters', async () => {
      // Create a 254 char email: local (243) + @ (1) + domain (10)
      const maxEmail = 'a'.repeat(243) + '@domain.com';
      const booking = new Booking({
        eventId: testEventId,
        email: maxEmail,
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toHaveLength(254);
    });
  });

  describe('Event Reference Validation', () => {
    it('should fail when referencing non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const booking = new Booking({
        eventId: nonExistentId,
        email: 'test@example.com',
      });
      
      await expect(booking.save()).rejects.toThrow(`Event with ID ${nonExistentId} does not exist`);
    });

    it('should succeed when referencing existing event', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      
      const savedBooking = await booking.save();
      expect(savedBooking.eventId).toEqual(testEventId);
    });

    it('should validate eventId only on new booking', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      
      // Update email without changing eventId
      savedBooking.email = 'newemail@example.com';
      const updatedBooking = await savedBooking.save();
      
      expect(updatedBooking.email).toBe('newemail@example.com');
    });

    it('should validate eventId when it is modified', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      
      // Try to change to non-existent event
      const nonExistentId = new mongoose.Types.ObjectId();
      savedBooking.eventId = nonExistentId;
      
      await expect(savedBooking.save()).rejects.toThrow(`Event with ID ${nonExistentId} does not exist`);
    });
  });

  describe('Unique Compound Index', () => {
    it('should prevent duplicate bookings for same event and email', async () => {
      const booking1 = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      await booking1.save();
      
      const booking2 = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      
      await expect(booking2.save()).rejects.toThrow();
    });

    it('should allow same email for different events', async () => {
      // Create another event
      const event2 = new Event({
        title: 'Second Event',
        description: 'Another test event',
        overview: 'Test overview',
        image: 'https://example.com/image.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-12-20',
        time: '14:00',
        mode: 'offline',
        audience: 'Everyone',
        agenda: ['Item 1'],
        organizer: 'Test Organizer',
        tags: ['test'],
      });
      const savedEvent2 = await event2.save();
      
      const booking1 = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      await booking1.save();
      
      const booking2 = new Booking({
        eventId: savedEvent2._id,
        email: 'test@example.com',
      });
      const savedBooking2 = await booking2.save();
      
      expect(savedBooking2.email).toBe('test@example.com');
      expect(savedBooking2.eventId).not.toEqual(testEventId);
    });

    it('should allow different emails for same event', async () => {
      const booking1 = new Booking({
        eventId: testEventId,
        email: 'user1@example.com',
      });
      await booking1.save();
      
      const booking2 = new Booking({
        eventId: testEventId,
        email: 'user2@example.com',
      });
      const savedBooking2 = await booking2.save();
      
      expect(savedBooking2.eventId).toEqual(testEventId);
      expect(savedBooking2.email).toBe('user2@example.com');
    });

    it('should have compound index on eventId and email', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      const compoundIndexExists = Object.values(indexes).some(
        (index: any) => index.eventId === 1 && index.email === 1
      );
      
      expect(compoundIndexExists).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt timestamp', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically add updatedAt timestamp', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.updatedAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      const originalUpdatedAt = savedBooking.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedBooking.email = 'newemail@example.com';
      const updatedBooking = await savedBooking.save();
      
      expect(updatedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on modification', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      const originalCreatedAt = savedBooking.createdAt;
      
      savedBooking.email = 'newemail@example.com';
      const updatedBooking = await savedBooking.save();
      
      expect(updatedBooking.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('Index Behavior', () => {
    it('should have index on eventId field', async () => {
      const indexes = await Booking.collection.getIndexes();
      
      expect(indexes).toHaveProperty('eventId_1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with plus addressing', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'user+tag@example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('user+tag@example.com');
    });

    it('should handle email with subdomain', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'user@mail.example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('user@mail.example.com');
    });

    it('should handle international domain names', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'user@example.co.uk',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('user@example.co.uk');
    });

    it('should handle numeric usernames', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: '12345@example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('12345@example.com');
    });

    it('should handle emails with dots in username', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'first.last@example.com',
      });
      const savedBooking = await booking.save();
      
      expect(savedBooking.email).toBe('first.last@example.com');
    });
  });

  describe('Population', () => {
    it('should populate event reference', async () => {
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      const savedBooking = await booking.save();
      
      const populatedBooking = await Booking.findById(savedBooking._id).populate('eventId');
      
      expect(populatedBooking).toBeDefined();
      expect(populatedBooking!.eventId).toHaveProperty('title');
      expect((populatedBooking!.eventId as any).title).toBe('Test Event for Bookings');
    });
  });

  describe('Error Handling in Pre-save Hook', () => {
    it('should handle errors gracefully during event validation', async () => {
      // Temporarily break the Event model
      const originalExists = Event.exists;
      Event.exists = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      
      await expect(booking.save()).rejects.toThrow('Failed to validate event reference: Database error');
      
      // Restore
      Event.exists = originalExists;
    });

    it('should handle non-Error exceptions in pre-save hook', async () => {
      // Temporarily break the Event model with non-Error exception
      const originalExists = Event.exists;
      Event.exists = jest.fn().mockRejectedValue('String error');
      
      const booking = new Booking({
        eventId: testEventId,
        email: 'test@example.com',
      });
      
      await expect(booking.save()).rejects.toThrow('Failed to validate event reference');
      
      // Restore
      Event.exists = originalExists;
    });
  });
});