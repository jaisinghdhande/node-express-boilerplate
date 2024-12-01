jest.setTimeout(30000);

// Mock Redis client
jest.mock('./src/config/redis', () => ({
  redisClient: {
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    on: jest.fn()
  },
  connectRedis: jest.fn()
}));