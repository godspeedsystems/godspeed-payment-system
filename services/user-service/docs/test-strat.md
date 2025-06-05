1. Test Objectives:
   - Ensure all user registration flows are working correctly.

2. Testing Scope:
   - Specifies what will and will not be tested.
   - List all functions to be tested.
     - Note: Currently, only the following can be tested:
       - Utility functions (no Godspeed init required)
       - Workflows without mocking (integration tests, Godspeed init required)
       - Complex workflows (Godspeed init required)
   - Functions to be tested:
     - registerUserToDB

3. Test Coverage:
   - Define the desired test coverage percentage (e.g., 80%).
   - Desired test coverage: 80%

4. Tools for Testing:
   - Specify which testing frameworks and tools will be used for:
     - Unit tests
     - Integration tests
     - E2E tests (if applicable)
   - Unit tests: Mocha
   - Integration tests: Chai

5. Location:
   - Define where to store the tests in the project directory.
   - Recommended structure: create a top-level `test` directory that mirrors the `src` directory.
   - Tests will be stored in a `test` directory mirroring the `src` directory.

6. How to Run the Tests:
   - List the commands needed to run the tests.
   - These commands will be added to the `scripts` section of `package.json`.
   - Command to run tests: npm test