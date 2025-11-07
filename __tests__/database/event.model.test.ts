import mongoose from 'mongoose';
import Event, { IEvent } from '@/database/event.model';
import { connect, closeDatabase, clearDatabase, clearModels } from '../test-utils';

describe('Event Model', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    clearModels();
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    const validEventData = {
      title: 'Tech Conference 2024',
      description: 'An amazing tech conference with industry leaders',
      overview: 'Join us for a day of learning and networking',
      image: 'https://example.com/image.jpg',
      venue: 'Convention Center',
      location: 'San Francisco, CA',
      date: '2024-12-15',
      time: '09:00',
      mode: 'hybrid',
      audience: 'Developers and Tech Enthusiasts',
      agenda: ['Opening Keynote', 'Workshop Sessions', 'Networking'],
      organizer: 'Tech Events Inc.',
      tags: ['technology', 'conference', 'networking'],
    };

    it('should create and save an event successfully with valid data', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();

      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe(validEventData.title);
      expect(savedEvent.slug).toBe('tech-conference-2024');
      expect(savedEvent.description).toBe(validEventData.description);
      expect(savedEvent.mode).toBe(validEventData.mode);
      expect(savedEvent.createdAt).toBeDefined();
      expect(savedEvent.updatedAt).toBeDefined();
    });

    it('should fail validation when title is missing', async () => {
      const eventWithoutTitle = new Event({ ...validEventData, title: undefined });
      
      await expect(eventWithoutTitle.save()).rejects.toThrow('Title is required');
    });

    it('should fail validation when description is missing', async () => {
      const eventWithoutDescription = new Event({ ...validEventData, description: undefined });
      
      await expect(eventWithoutDescription.save()).rejects.toThrow('Description is required');
    });

    it('should fail validation when overview is missing', async () => {
      const eventWithoutOverview = new Event({ ...validEventData, overview: undefined });
      
      await expect(eventWithoutOverview.save()).rejects.toThrow('Overview is required');
    });

    it('should fail validation when image is missing', async () => {
      const eventWithoutImage = new Event({ ...validEventData, image: undefined });
      
      await expect(eventWithoutImage.save()).rejects.toThrow('Image URL is required');
    });

    it('should fail validation when venue is missing', async () => {
      const eventWithoutVenue = new Event({ ...validEventData, venue: undefined });
      
      await expect(eventWithoutVenue.save()).rejects.toThrow('Venue is required');
    });

    it('should fail validation when location is missing', async () => {
      const eventWithoutLocation = new Event({ ...validEventData, location: undefined });
      
      await expect(eventWithoutLocation.save()).rejects.toThrow('Location is required');
    });

    it('should fail validation when date is missing', async () => {
      const eventWithoutDate = new Event({ ...validEventData, date: undefined });
      
      await expect(eventWithoutDate.save()).rejects.toThrow('Date is required');
    });

    it('should fail validation when time is missing', async () => {
      const eventWithoutTime = new Event({ ...validEventData, time: undefined });
      
      await expect(eventWithoutTime.save()).rejects.toThrow('Time is required');
    });

    it('should fail validation when mode is missing', async () => {
      const eventWithoutMode = new Event({ ...validEventData, mode: undefined });
      
      await expect(eventWithoutMode.save()).rejects.toThrow('Mode is required');
    });

    it('should fail validation when audience is missing', async () => {
      const eventWithoutAudience = new Event({ ...validEventData, audience: undefined });
      
      await expect(eventWithoutAudience.save()).rejects.toThrow('Audience is required');
    });

    it('should fail validation when organizer is missing', async () => {
      const eventWithoutOrganizer = new Event({ ...validEventData, organizer: undefined });
      
      await expect(eventWithoutOrganizer.save()).rejects.toThrow('Organizer is required');
    });
  });

  describe('Field Length Validation', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should fail when title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      const event = new Event({ ...validEventData, title: longTitle });
      
      await expect(event.save()).rejects.toThrow('Title cannot exceed 200 characters');
    });

    it('should succeed when title is exactly 200 characters', async () => {
      const maxTitle = 'a'.repeat(200);
      const event = new Event({ ...validEventData, title: maxTitle });
      
      const savedEvent = await event.save();
      expect(savedEvent.title).toHaveLength(200);
    });

    it('should fail when description exceeds 2000 characters', async () => {
      const longDescription = 'a'.repeat(2001);
      const event = new Event({ ...validEventData, description: longDescription });
      
      await expect(event.save()).rejects.toThrow('Description cannot exceed 2000 characters');
    });

    it('should succeed when description is exactly 2000 characters', async () => {
      const maxDescription = 'a'.repeat(2000);
      const event = new Event({ ...validEventData, description: maxDescription });
      
      const savedEvent = await event.save();
      expect(savedEvent.description).toHaveLength(2000);
    });

    it('should fail when overview exceeds 1000 characters', async () => {
      const longOverview = 'a'.repeat(1001);
      const event = new Event({ ...validEventData, overview: longOverview });
      
      await expect(event.save()).rejects.toThrow('Overview cannot exceed 1000 characters');
    });

    it('should succeed when overview is exactly 1000 characters', async () => {
      const maxOverview = 'a'.repeat(1000);
      const event = new Event({ ...validEventData, overview: maxOverview });
      
      const savedEvent = await event.save();
      expect(savedEvent.overview).toHaveLength(1000);
    });
  });

  describe('Mode Enum Validation', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should accept "online" as valid mode', async () => {
      const event = new Event({ ...validEventData, mode: 'online' });
      const savedEvent = await event.save();
      
      expect(savedEvent.mode).toBe('online');
    });

    it('should accept "offline" as valid mode', async () => {
      const event = new Event({ ...validEventData, mode: 'offline' });
      const savedEvent = await event.save();
      
      expect(savedEvent.mode).toBe('offline');
    });

    it('should accept "hybrid" as valid mode', async () => {
      const event = new Event({ ...validEventData, mode: 'hybrid' });
      const savedEvent = await event.save();
      
      expect(savedEvent.mode).toBe('hybrid');
    });

    it('should reject invalid mode value', async () => {
      const event = new Event({ ...validEventData, mode: 'invalid' });
      
      await expect(event.save()).rejects.toThrow('Mode must be online, offline, or hybrid');
    });
  });

  describe('Array Field Validation', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should fail when agenda is an empty array', async () => {
      const event = new Event({ ...validEventData, agenda: [] });
      
      await expect(event.save()).rejects.toThrow('Agenda cannot be empty');
    });

    it('should fail when agenda is missing', async () => {
      const event = new Event({ ...validEventData, agenda: undefined });
      
      await expect(event.save()).rejects.toThrow('Agenda is required');
    });

    it('should succeed with multiple agenda items', async () => {
      const multipleAgenda = ['Item 1', 'Item 2', 'Item 3'];
      const event = new Event({ ...validEventData, agenda: multipleAgenda });
      const savedEvent = await event.save();
      
      expect(savedEvent.agenda).toEqual(multipleAgenda);
    });

    it('should fail when tags is an empty array', async () => {
      const event = new Event({ ...validEventData, tags: [] });
      
      await expect(event.save()).rejects.toThrow('Tags cannot be empty');
    });

    it('should fail when tags is missing', async () => {
      const event = new Event({ ...validEventData, tags: undefined });
      
      await expect(event.save()).rejects.toThrow('Tags are required');
    });

    it('should succeed with multiple tags', async () => {
      const multipleTags = ['tech', 'conference', 'networking', 'ai'];
      const event = new Event({ ...validEventData, tags: multipleTags });
      const savedEvent = await event.save();
      
      expect(savedEvent.tags).toEqual(multipleTags);
    });
  });

  describe('Slug Generation', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should generate slug from title', async () => {
      const event = new Event({ ...validEventData, title: 'My Amazing Event' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('my-amazing-event');
    });

    it('should convert title to lowercase in slug', async () => {
      const event = new Event({ ...validEventData, title: 'UPPERCASE EVENT' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('uppercase-event');
    });

    it('should replace spaces with hyphens in slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event With Many Spaces' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('event-with-many-spaces');
    });

    it('should remove special characters from slug', async () => {
      const event = new Event({ ...validEventData, title: 'Event!@#$%^&*()With Special' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('eventwith-special');
    });

    it('should replace multiple consecutive spaces/hyphens with single hyphen', async () => {
      const event = new Event({ ...validEventData, title: 'Event   With    Multiple     Spaces' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('event-with-multiple-spaces');
    });

    it('should remove leading and trailing hyphens', async () => {
      const event = new Event({ ...validEventData, title: '---Event---' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('event');
    });

    it('should handle underscores in title', async () => {
      const event = new Event({ ...validEventData, title: 'Event_With_Underscores' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('event-with-underscores');
    });

    it('should update slug when title is modified', async () => {
      const event = new Event({ ...validEventData, title: 'Original Title' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('original-title');
      
      savedEvent.title = 'Updated Title';
      const updatedEvent = await savedEvent.save();
      
      expect(updatedEvent.slug).toBe('updated-title');
    });

    it('should enforce unique slug constraint', async () => {
      const event1 = new Event({ ...validEventData, title: 'Same Event' });
      await event1.save();
      
      const event2 = new Event({ ...validEventData, title: 'Same Event' });
      await expect(event2.save()).rejects.toThrow();
    });
  });

  describe('Date Normalization', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should accept date in YYYY-MM-DD format', async () => {
      const event = new Event({ ...validEventData, date: '2024-12-15' });
      const savedEvent = await event.save();
      
      expect(savedEvent.date).toBe('2024-12-15');
    });

    it('should normalize ISO date string to YYYY-MM-DD', async () => {
      const event = new Event({ ...validEventData, date: '2024-12-15T10:30:00.000Z' });
      const savedEvent = await event.save();
      
      expect(savedEvent.date).toBe('2024-12-15');
    });

    it('should fail with invalid date format', async () => {
      const event = new Event({ ...validEventData, date: 'invalid-date' });
      
      await expect(event.save()).rejects.toThrow('Date must be in a valid format');
    });

    it('should update date when modified', async () => {
      const event = new Event({ ...validEventData, date: '2024-12-15' });
      const savedEvent = await event.save();
      
      savedEvent.date = '2025-01-20';
      const updatedEvent = await savedEvent.save();
      
      expect(updatedEvent.date).toBe('2025-01-20');
    });
  });

  describe('Time Normalization', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should accept time in HH:MM format', async () => {
      const event = new Event({ ...validEventData, time: '14:30' });
      const savedEvent = await event.save();
      
      expect(savedEvent.time).toBe('14:30');
    });

    it('should accept time with single digit hour', async () => {
      const event = new Event({ ...validEventData, time: '9:30' });
      const savedEvent = await event.save();
      
      expect(savedEvent.time).toBe('09:30');
    });

    it('should normalize 24-hour format correctly', async () => {
      const event = new Event({ ...validEventData, time: '23:59' });
      const savedEvent = await event.save();
      
      expect(savedEvent.time).toBe('23:59');
    });

    it('should normalize midnight as 00:00', async () => {
      const event = new Event({ ...validEventData, time: '00:00' });
      const savedEvent = await event.save();
      
      expect(savedEvent.time).toBe('00:00');
    });

    it('should fail with invalid time format', async () => {
      const event = new Event({ ...validEventData, time: '25:00' });
      
      await expect(event.save()).rejects.toThrow('Time must be in HH:MM format');
    });

    it('should fail with non-time string', async () => {
      const event = new Event({ ...validEventData, time: 'invalid' });
      
      await expect(event.save()).rejects.toThrow('Time must be in HH:MM format');
    });
  });

  describe('Trimming Behavior', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should trim whitespace from title', async () => {
      const event = new Event({ ...validEventData, title: '  Trimmed Title  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.title).toBe('Trimmed Title');
    });

    it('should trim whitespace from description', async () => {
      const event = new Event({ ...validEventData, description: '  Trimmed Description  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.description).toBe('Trimmed Description');
    });

    it('should trim whitespace from overview', async () => {
      const event = new Event({ ...validEventData, overview: '  Trimmed Overview  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.overview).toBe('Trimmed Overview');
    });

    it('should trim whitespace from image', async () => {
      const event = new Event({ ...validEventData, image: '  https://example.com/image.jpg  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.image).toBe('https://example.com/image.jpg');
    });

    it('should trim whitespace from venue', async () => {
      const event = new Event({ ...validEventData, venue: '  Convention Center  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.venue).toBe('Convention Center');
    });

    it('should trim whitespace from location', async () => {
      const event = new Event({ ...validEventData, location: '  San Francisco  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.location).toBe('San Francisco');
    });

    it('should trim whitespace from audience', async () => {
      const event = new Event({ ...validEventData, audience: '  Developers  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.audience).toBe('Developers');
    });

    it('should trim whitespace from organizer', async () => {
      const event = new Event({ ...validEventData, organizer: '  Tech Events Inc.  ' });
      const savedEvent = await event.save();
      
      expect(savedEvent.organizer).toBe('Tech Events Inc.');
    });
  });

  describe('Timestamps', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should automatically add createdAt timestamp', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();
      
      expect(savedEvent.createdAt).toBeDefined();
      expect(savedEvent.createdAt).toBeInstanceOf(Date);
    });

    it('should automatically add updatedAt timestamp', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();
      
      expect(savedEvent.updatedAt).toBeDefined();
      expect(savedEvent.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();
      const originalUpdatedAt = savedEvent.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedEvent.title = 'Updated Title';
      const updatedEvent = await savedEvent.save();
      
      expect(updatedEvent.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on modification', async () => {
      const event = new Event(validEventData);
      const savedEvent = await event.save();
      const originalCreatedAt = savedEvent.createdAt;
      
      savedEvent.title = 'Updated Title';
      const updatedEvent = await savedEvent.save();
      
      expect(updatedEvent.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('Index Behavior', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should have index on slug field', async () => {
      const indexes = await Event.collection.getIndexes();
      
      expect(indexes).toHaveProperty('slug_1');
    });

    it('should enforce unique slug index', async () => {
      const event1 = new Event({ ...validEventData, title: 'Unique Event' });
      await event1.save();
      
      const event2 = new Event({ ...validEventData, title: 'Unique Event' });
      
      await expect(event2.save()).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'https://example.com/image.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-12-15',
      time: '09:00',
      mode: 'online',
      audience: 'Everyone',
      agenda: ['Item 1'],
      organizer: 'Organizer',
      tags: ['tag1'],
    };

    it('should handle Unicode characters in title', async () => {
      const event = new Event({ ...validEventData, title: 'Événement en Français 日本語' });
      const savedEvent = await event.save();
      
      expect(savedEvent.title).toBe('Événement en Français 日本語');
      expect(savedEvent.slug).toBe('vnement-en-franais');
    });

    it('should handle empty string after special character removal in title', async () => {
      const event = new Event({ ...validEventData, title: '!@#$%^&*()' });
      const savedEvent = await event.save();
      
      expect(savedEvent.slug).toBe('');
    });

    it('should handle very long agenda arrays', async () => {
      const longAgenda = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
      const event = new Event({ ...validEventData, agenda: longAgenda });
      const savedEvent = await event.save();
      
      expect(savedEvent.agenda).toHaveLength(100);
    });

    it('should handle very long tags arrays', async () => {
      const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i + 1}`);
      const event = new Event({ ...validEventData, tags: manyTags });
      const savedEvent = await event.save();
      
      expect(savedEvent.tags).toHaveLength(50);
    });

    it('should handle leap year dates correctly', async () => {
      const event = new Event({ ...validEventData, date: '2024-02-29' });
      const savedEvent = await event.save();
      
      expect(savedEvent.date).toBe('2024-02-29');
    });
  });
});