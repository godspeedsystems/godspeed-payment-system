import helloworld from '../../functions/helloworld';
import { GSContext, GSStatus } from '@godspeedsystems/core';

describe('helloworld unit test', () => {
  it('should return a greeting with the provided name', () => {
    // Mock GSContext
    const mockCtx: GSContext = {
      inputs: {
        data: {
          query: { name: 'TestUser' },
          params: {},
          body: {},
          user: {},
          headers: {}
        }
      },
      // Add other necessary mock properties for GSContext if the function used them
      // For this simple function, inputs.data is sufficient
    } as any; // Use 'as any' or mock the full type if needed

    // Call the function
    const result = helloworld(mockCtx, {});

    // Assert the result
    expect(result).toBeInstanceOf(GSStatus);
    expect(result.status).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe('Hello TestUser');
    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it('should return a greeting with undefined name if not provided', () => {
    // Mock GSContext with no name in query
    const mockCtx: GSContext = {
      inputs: {
        data: {
          query: {},
          params: {},
          body: {},
          user: {},
          headers: {}
        }
      },
    } as any;

    // Call the function
    const result = helloworld(mockCtx, {});

    // Assert the result
    expect(result).toBeInstanceOf(GSStatus);
    expect(result.status).toBe(true);
    expect(result.code).toBe(200);
    expect(result.message).toBe('Hello undefined'); // Or 'Hello ' depending on JS coercion
    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  // Add more test cases for edge cases or different inputs if applicable
});