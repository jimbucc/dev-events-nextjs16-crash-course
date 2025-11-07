import mongoose, { Document, Schema, model, models, Types } from 'mongoose';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email validation regex pattern
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking schema definition with validation and indexes
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries by eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => emailRegex.test(email),
        message: 'Please provide a valid email address',
      },
      maxlength: [254, 'Email cannot exceed 254 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook to validate that the referenced Event exists
 */
BookingSchema.pre<IBooking>('save', async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    try {
      // Import Event model dynamically to avoid circular dependency
      const Event = mongoose.models.Event || (await import('./event.model')).default;
      
      // Check if the event exists
      const eventExists = await Event.exists({ _id: this.eventId });
      
      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    } catch (error) {
      if (error instanceof Error) {
        return next(new Error(`Failed to validate event reference: ${error.message}`));
      }
      return next(new Error('Failed to validate event reference'));
    }
  }

  next();
});

/**
 * Compound index for eventId and email to prevent duplicate bookings
 */
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

/**
 * Export Booking model, reuse existing model if already compiled
 */
const Booking = models?.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;