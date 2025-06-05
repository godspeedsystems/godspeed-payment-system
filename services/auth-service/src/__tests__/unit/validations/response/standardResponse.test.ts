import standardResponse from '../../../../functions/validations/response/standardResponse';
import { GSContext } from '@godspeedsystems/core';

describe('standardResponse unit test', () => {
  it('should return a standard error response with validation details and 500 code', () => {
    const mockValidationError = [{ keyword: 'type', message: 'data should be object' }];
    const mockEvent = 'testEvent';
    const mockMessage = 'Validation failed';

    // Mock GSContext
    const mockCtx: GSContext = {
      inputs: {
        data: {
          validation_error: mockValidationError,
          event: mockEvent,
          message: mockMessage
        }
      },
    } as any;

    // Call the function
    const result = standardResponse(mockCtx);

    // Assert the result
    expect(result).toEqual({
      success: false,
      data: {
        validation_error: mockValidationError,
        event: mockEvent,
        message: mockMessage
      },
      code: 500
    });
  });

  it('should return a standard error response with undefined data if not provided and 500 code', () => {
    // Mock GSContext with no validation error, event, or message
    const mockCtx: GSContext = {
      inputs: {
        data: {}
      },
    } as any;

    // Call the function
    const result = standardResponse(mockCtx);

    // Assert the result
    expect(result).toEqual({
      success: false,
      data: {
        validation_error: undefined,
        event: undefined,
        message: undefined
      },
      code: 500
    });
  });

  // Add more test cases for different validation error structures if applicable
});