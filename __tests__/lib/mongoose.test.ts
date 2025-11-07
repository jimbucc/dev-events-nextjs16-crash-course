import mongoose from 'mongoose';

// Mock environment variable
const MOCK_MONGODB_URL = 'mongodb://localhost:27017/test-db';

describe('Mongoose Connection Utility', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalMongoose: typeof global.mongoose;

  beforeEach(() => {
    // Save original environment and global mongoose
    originalEnv = { ...process.env };
    originalMongoose = global.mongoose;
    
    // Clean up mongoose connections
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
    
    // Reset global mongoose cache
    delete global.mongoose;
    
    // Clear module cache to reload the module with fresh state
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    global.mongoose = originalMongoose;
    
    // Disconnect if connected
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when MONGODB_URL is not defined', () => {
      delete process.env.MONGODB_URL;
      
      expect(() => {
        require('@/lib/mongoose');
      }).toThrow('Please define the MONGODB_URL environment variable inside .env');
    });

    it('should not throw error when MONGODB_URL is defined', () => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
      
      expect(() => {
        require('@/lib/mongoose');
      }).not.toThrow();
    });
  });

  describe('Connection State Functions', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should export isConnected function', () => {
      const mongooseModule = require('@/lib/mongoose');
      
      expect(mongooseModule.isConnected).toBeDefined();
      expect(typeof mongooseModule.isConnected).toBe('function');
    });

    it('should export getConnectionState function', () => {
      const mongooseModule = require('@/lib/mongoose');
      
      expect(mongooseModule.getConnectionState).toBeDefined();
      expect(typeof mongooseModule.getConnectionState).toBe('function');
    });

    it('should export disconnect function', () => {
      const mongooseModule = require('@/lib/mongoose');
      
      expect(mongooseModule.disconnect).toBeDefined();
      expect(typeof mongooseModule.disconnect).toBe('function');
    });

    it('isConnected should return false when disconnected', () => {
      const { isConnected } = require('@/lib/mongoose');
      
      expect(isConnected()).toBe(false);
    });

    it('getConnectionState should return "disconnected" initially', () => {
      const { getConnectionState } = require('@/lib/mongoose');
      
      expect(getConnectionState()).toBe('disconnected');
    });

    it('getConnectionState should handle all connection states', () => {
      const { getConnectionState } = require('@/lib/mongoose');
      
      // Test disconnected state (0)
      mongoose.connection.readyState = 0;
      expect(getConnectionState()).toBe('disconnected');
      
      // Test connected state (1)
      mongoose.connection.readyState = 1;
      expect(getConnectionState()).toBe('connected');
      
      // Test connecting state (2)
      mongoose.connection.readyState = 2;
      expect(getConnectionState()).toBe('connecting');
      
      // Test disconnecting state (3)
      mongoose.connection.readyState = 3;
      expect(getConnectionState()).toBe('disconnecting');
      
      // Test unknown state
      mongoose.connection.readyState = 99 as any;
      expect(getConnectionState()).toBe('unknown');
    });
  });

  describe('Disconnect Function', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should disconnect successfully when connected', async () => {
      const { disconnect } = require('@/lib/mongoose');
      
      // Mock mongoose.disconnect
      const disconnectSpy = jest.spyOn(mongoose, 'disconnect').mockResolvedValue();
      
      // Set up cache
      global.mongoose = { conn: {} as any, promise: null };
      
      await disconnect();
      
      expect(disconnectSpy).toHaveBeenCalled();
      expect(global.mongoose.conn).toBeNull();
      expect(global.mongoose.promise).toBeNull();
      
      disconnectSpy.mockRestore();
    });

    it('should not call mongoose.disconnect when no connection exists', async () => {
      const { disconnect } = require('@/lib/mongoose');
      
      const disconnectSpy = jest.spyOn(mongoose, 'disconnect');
      
      // No connection
      global.mongoose = { conn: null, promise: null };
      
      await disconnect();
      
      expect(disconnectSpy).not.toHaveBeenCalled();
      
      disconnectSpy.mockRestore();
    });
  });

  describe('Global Cache Behavior', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should initialize global mongoose cache if not exists', () => {
      delete global.mongoose;
      
      require('@/lib/mongoose');
      
      expect(global.mongoose).toBeDefined();
      expect(global.mongoose).toHaveProperty('conn');
      expect(global.mongoose).toHaveProperty('promise');
    });

    it('should reuse existing global mongoose cache', () => {
      const existingCache = { conn: {} as any, promise: null };
      global.mongoose = existingCache;
      
      require('@/lib/mongoose');
      
      expect(global.mongoose).toBe(existingCache);
    });

    it('should initialize cache with null values', () => {
      delete global.mongoose;
      
      require('@/lib/mongoose');
      
      expect(global.mongoose.conn).toBeNull();
      expect(global.mongoose.promise).toBeNull();
    });
  });

  describe('Connection Event Listeners', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should register connected event listener', () => {
      const onSpy = jest.spyOn(mongoose.connection, 'on');
      
      require('@/lib/mongoose');
      
      expect(onSpy).toHaveBeenCalledWith('connected', expect.any(Function));
      
      onSpy.mockRestore();
    });

    it('should register error event listener', () => {
      const onSpy = jest.spyOn(mongoose.connection, 'on');
      
      require('@/lib/mongoose');
      
      expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
      
      onSpy.mockRestore();
    });

    it('should register disconnected event listener', () => {
      const onSpy = jest.spyOn(mongoose.connection, 'on');
      
      require('@/lib/mongoose');
      
      expect(onSpy).toHaveBeenCalledWith('disconnected', expect.any(Function));
      
      onSpy.mockRestore();
    });
  });

  describe('Module Exports', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should export connectToDatabase as default', () => {
      const mongooseModule = require('@/lib/mongoose');
      
      expect(mongooseModule.default).toBeDefined();
      expect(typeof mongooseModule.default).toBe('function');
    });

    it('should export named functions', () => {
      const mongooseModule = require('@/lib/mongoose');
      
      expect(mongooseModule).toHaveProperty('isConnected');
      expect(mongooseModule).toHaveProperty('getConnectionState');
      expect(mongooseModule).toHaveProperty('disconnect');
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      process.env.MONGODB_URL = MOCK_MONGODB_URL;
    });

    it('should have proper TypeScript types for exports', () => {
      const { isConnected, getConnectionState, disconnect } = require('@/lib/mongoose');
      
      // These checks ensure TypeScript types are working
      expect(typeof isConnected()).toBe('boolean');
      expect(typeof getConnectionState()).toBe('string');
      expect(disconnect()).toBeInstanceOf(Promise);
    });
  });
});