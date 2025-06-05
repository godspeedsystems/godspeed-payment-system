// Note: Testing YAML-defined functions directly can be challenging as they are executed by the Godspeed framework.
// This test simulates the logic defined within the `com.gs.transform` task in the YAML file.
// A more comprehensive test might involve mocking the Godspeed execution environment or using integration tests.

describe('standardResponseyml transform logic unit test', () => {
  // Simulate the inline JavaScript logic from the YAML
  const transformLogic = (inputs: any) => {
    const { validation_error, event, message } = inputs;
    return { validation_error, event, message };
  };

  it('should return validation details, event, and message when provided', () => {
    const mockInputs = {
      validation_error: [{ keyword: 'required', message: 'data should have required property \'id\'' }],
      event: 'testEvent',
      message: 'Validation failed for ID',
    };

    const result = transformLogic(mockInputs);

    expect(result).toEqual({
      validation_error: mockInputs.validation_error,
      event: mockInputs.event,
      message: mockInputs.message,
    });
  });

  it('should return undefined for missing fields', () => {
    const mockInputs = {}; // No validation_error, event, or message

    const result = transformLogic(mockInputs);

    expect(result).toEqual({
      validation_error: undefined,
      event: undefined,
      message: undefined,
    });
  });

  it('should handle partial inputs', () => {
    const mockInputs = {
      validation_error: [{ keyword: 'type', message: 'data should be string' }],
      event: 'anotherEvent',
      // message is missing
    };

    const result = transformLogic(mockInputs);

    expect(result).toEqual({
      validation_error: mockInputs.validation_error,
      event: mockInputs.event,
      message: undefined,
    });
  });
});