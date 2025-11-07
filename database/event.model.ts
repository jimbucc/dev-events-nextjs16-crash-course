import { Document, Schema, model, models } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition with validation and indexes
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      maxlength: [1000, 'Overview cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (agenda: string[]) => agenda.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (tags: string[]) => tags.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook to generate slug from title and normalize date/time
 */
EventSchema.pre<IEvent>('save', function (next) {
  // Generate slug only if title is new or modified
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO format if modified
  if (this.isNew || this.isModified('date')) {
    try {
      const normalizedDate = new Date(this.date);
      if (isNaN(normalizedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      this.date = normalizedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return next(new Error('Date must be in a valid format (YYYY-MM-DD or ISO string)'));
    }
  }

  // Normalize time to consistent format (HH:MM)
  if (this.isNew || this.isModified('time')) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(this.time)) {
      // Try to parse common time formats
      try {
        const timeObj = new Date(`2000-01-01T${this.time}`);
        if (isNaN(timeObj.getTime())) {
          throw new Error('Invalid time');
        }
        this.time = timeObj.toTimeString().slice(0, 5); // HH:MM format
      } catch {
        return next(new Error('Time must be in HH:MM format'));
      }
    }
  }

  // Validate required array fields are not empty
  if (this.agenda.length === 0) {
    return next(new Error('Agenda cannot be empty'));
  }
  if (this.tags.length === 0) {
    return next(new Error('Tags cannot be empty'));
  }

  next();
});

/**
 * Export Event model, reuse existing model if already compiled
 */
const Event = models?.Event || model<IEvent>('Event', EventSchema);

export default Event;