import registerUser from '../../functions/registerUser';
import { GSContext, GSStatus, GSDataSource } from '@godspeedsystems/core';
import crypto from 'crypto';

// Mock the crypto module to control hashPassword
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  pbkdf2: jest.fn((password, salt, iterations, keylen, digest, callback) => {
    // Simulate hashing
    const derivedKey = Buffer.from(`hashed_${password}_${salt}`);
    callback(null, derivedKey);
  }),
  randomBytes: jest.fn((size) => {
    // Simulate salt generation
    return Buffer.from('mockedsalt'.repeat(size / 10));
  }),
}));

// Mock the @godspeedsystems/core module to mock GSContext and GSStatus
jest.mock('@godspeedsystems/core', () => ({
  ...jest.requireActual('@godspeedsystems/core'),
  GSContext: jest.fn().mockImplementation((ctx) => ctx), // Simple mock, adjust if needed
  GSStatus: jest.fn().mockImplementation((status, code, message, data, error) => ({
    status,
    code,
    message,
    data,
    error,
  })),
  GSDataSource: jest.fn(), // Mock GSDataSource
  logger: { // Mock logger to prevent console output during tests
    info: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('registerUser unit test', () => {
  let mockCtx: GSContext;
  let mockUserService: jest.Mocked<GSDataSource>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the userService datasource
    mockUserService = {
      execute: jest.fn(),
      // Add other methods if they are used by the function
    } as any; // Use 'as any' or mock the full type if needed

    // Mock GSContext with necessary properties
    mockCtx = {
      inputs: {
        data: {
          body: {}, // Default empty body
        },
      },
      datasources: {
        userService: mockUserService,
      },
      logger: { // Use the mocked logger
        info: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
      },
      // Add other necessary mock properties for GSContext if the function used them
    } as any;
  });

  it('should successfully register a user with valid inputs', async () => {
    // Set valid inputs
    mockCtx.inputs.data.body = {
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    };

    // Mock the userService execute call to return a successful response
    mockUserService.execute.mockResolvedValue({
      data: {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      },
    });

    // Call the function
    const result = await registerUser(mockCtx);

    // Assert the result
    // Assert the result structure and values
    expect(result).toEqual({ // Use toEqual for deep comparison of object structure
      status: true, // Assert status directly
      code: 201,
      message: 'User registered successfully',
      data: {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        passwordHash: 'mockedsaltmockedsalt:hashed_password123_mockedsaltmockedsalt', // Based on mocked crypto
        axiosResponse: {
          data: {
            userId: 'user123',
            email: 'test@example.com',
            role: 'user',
            status: 'active',
          },
        },
      },
      error: undefined, // Assert error directly
    });

    // Verify userService.execute was called with correct arguments
    expect(mockUserService.execute).toHaveBeenCalledWith(mockCtx, {
      meta: {
        method: 'post',
        url: '/user',
      },
      data: {
        email: 'test@example.com',
        passwordHash: 'mockedsaltmockedsalt:hashed_password123_mockedsaltmockedsalt',
        role: 'user',
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    // Test case with missing email
    mockCtx.inputs.data.body = {
      password: 'password123',
      role: 'user',
    };

    let result = await registerUser(mockCtx);

    expect(result).toEqual({ // Use toEqual for deep comparison of object structure
      status: false, // Assert status directly
      code: 400,
      message: 'Missing required fields',
      data: { missing: ['email', 'password', 'role'] }, // The function checks all three
      error: undefined, // Assert error directly
    });

    // Test case with missing password
    mockCtx.inputs.data.body = {
      email: 'test@example.com',
      role: 'user',
    };

    result = await registerUser(mockCtx);

    expect(result).toEqual({ // Use toEqual for deep comparison of object structure
      status: false, // Assert status directly
      code: 400,
      message: 'Missing required fields',
      data: { missing: ['email', 'password', 'role'] },
      error: undefined, // Assert error directly
    });

    // Test case with missing role
    mockCtx.inputs.data.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    result = await registerUser(mockCtx);

    expect(result).toEqual({ // Use toEqual for deep comparison of object structure
      status: false, // Assert status directly
      code: 400,
      message: 'Missing required fields',
      data: { missing: ['email', 'password', 'role'] },
      error: undefined, // Assert error directly
    });
  });

  it('should return 500 if userService datasource call fails or returns no data', async () => {
    // Set valid inputs
    mockCtx.inputs.data.body = {
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
    };

    // Mock the userService execute call to return no data
    mockUserService.execute.mockResolvedValue({ data: null });

    // Call the function
    const result = await registerUser(mockCtx);

    // Assert the result
    expect(result).toEqual({ // Use toEqual for deep comparison of object structure
      status: false, // Assert status directly
      code: 500,
      message: 'Failed to register user',
      data: { message: 'userService did not return data' },
      error: undefined, // Assert error directly
    });
  });

  // Add more test cases for edge cases or different inputs if applicable
});