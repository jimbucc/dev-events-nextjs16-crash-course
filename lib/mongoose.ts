import mongoose, { Mongoose } from 'mongoose';

/**
 * Interface for caching the MongoDB connection
 * This prevents multiple connections during development hot reloads
 */
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the global object to include our mongoose cache
 * This ensures the cache persists across hot reloads in development
 */
declare global {
  var mongoose: MongooseConnection | undefined;
}

// Get MongoDB URL from environment variables
const MONGODB_URL = process.env.MONGODB_URL;

// Validate that MongoDB URL is provided
if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable inside .env');
}

// Type assertion after validation
const mongoUrl: string = MONGODB_URL;

/**
 * Global cache for the mongoose connection
 * In production, this variable will be undefined and recreated each time
 * In development, this variable will persist across module reloads
 */
const cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB with caching to prevent multiple connections
 * @returns Promise<Mongoose> - The mongoose connection instance
 */
async function connectToDatabase(): Promise<Mongoose> {
  // If connection already exists, return it
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  // If no connection exists but there's a promise, wait for it
  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    
    const options = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Create the connection promise
    cached.promise = mongoose.connect(mongoUrl, options).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      // Reset the promise so we can try again
      cached.promise = null;
      throw error;
    });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset both cache and promise if connection fails
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

/**
 * Get the current connection status
 * @returns boolean - true if connected, false otherwise
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get connection state as human readable string
 * @returns string - Current connection state
 */
export function getConnectionState(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or when shutting down the application
 */
export async function disconnect(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('📤 Disconnected from MongoDB');
  }
}

// Set up connection event listeners for better debugging
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📤 Mongoose disconnected from MongoDB');
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

// Export the main connection function as default
export default connectToDatabase;