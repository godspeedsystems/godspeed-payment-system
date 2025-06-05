import standardResponse from '../../../../functions/validations/request/standardResponse';
import { GSContext } from '@godspeedsystems/core';

describe('standardResponse unit test', () => {
  it('should return a standard error response with validation details', () => {
    const mockValidationError = [{ keyword: 'required', message: 'data should have required property \'name\'' }];
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
      code: 400
    });
  });

  it('should return a standard error response with undefined data if not provided', () => {
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
      code: 400
    });
  });

  // Add more test cases for different validation error structures if applicable
});