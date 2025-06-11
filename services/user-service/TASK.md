## The Problem

Writing comprehensive and consistent test cases for Godspeed projects can be time-consuming and error-prone, especially when developers skip setting up a proper testing framework or neglect to write the required `test-strat.md` document. Additionally, keeping test cases aligned with the codebase, PRD, and TRD manually adds overhead, reducing developer velocity and increasing chances of bugs slipping through.\[/+]

## The Solution

Introduce an LLM/AI agent that automates the process of test generation in Godspeed projects. The agent interacts with the user to ensure a valid testing strategy is in place, scaffolds the necessary test directory and files, and then uses structured inputs (like `test-strat.md`, PRD, TRD, and the codebase) to generate effective test cases automatically. It ensures all important scenarios are tested based on available context, flags missing documentation, and optionally runs tests for validation.\[/+]

## How will we solve

1. **User initiates**: User prompts the LLM to generate test cases.
2. **Locate or create test strategy**:

   * The LLM checks the `docs/` directory for `test-strat.md`.
   * If not found, it informs the user and either:

     * Accepts a user-provided strategy document, or
     * Generates a new one using a predefined template based on user input.
3. **Document support**:

   * LLM also looks for PRD and TRD in the `docs/` directory to understand product behavior and technical requirements.
4. **Scaffold generation**:

   * LLM runs `npm run gen-test-scaffolding` that runs the two files - general-test-scaffolding.ts and eventhandlers-test-scaffolding.ts files. The first file will generate the following directory structure and files -
test/
├── eventHandlers/           # Tests for each event handler
├── helpers/                 # Utility functions for testing
│   ├── makeContext.ts       # Creates mock GSContext
│   └── makeEvent.ts         # Creates mock event payloads
└── hooks/globalSetup.ts       # Setup code to run before all tests
it will also, add few scripts to package.json and configure some more required configs.
the second file will iterate through src/functions folder and for each ts file it will generate the test scaffolding file and save it in eventHandlers in test directory.
5. **Test case generation**:

   * LLM iterates through the `src/events/` directory.
   * For each event handler:

     * Uses the summary, comments, code, and TRD to generate input-output-based test cases.
     * Tests both valid and invalid input scenarios, not based on schema but based on business logic.
     * Verifies that output matches the response schema defined for different status codes.
     * Skips test generation if no summary is found in both event and TRD, and logs this in `test-strat.md`.
6. **Test execution**:

   * Optionally runs `npm run test` or instructs the user to run it, based on setup preference.

### **`test-strat.md` Template**

```markdown
# Test Strategy Document

## 1. Objective
Define a clear, structured approach to testing for this Godspeed project. Ensure coverage of all key event handlers, with automated validation of expected behavior and outputs using a standardized framework and directory layout.

## 2. Testing Framework: Mocha + Chai

## 3. Test Coverage: x%

## 4. Test Directory Structure
test/
├── eventHandlers/           # Tests for each event handler
├── helpers/                 # Utility functions for testing
│   ├── makeContext.ts       # Creates mock GSContext
│   └── makeEvent.ts         # Creates mock event payloads
└── hooks/globalSetup.ts       # Setup code to run before all tests

## 5. In Scope
- **Event Handlers**:  
  For each event handler, a corresponding test file will be created.  
  - Source: `src/events`
  - Input for test generation:
    - Summary in event file
    - Comments in function code
    - Actual code logic
    - TRD descriptions (if available)
  - Test cases will include:
    - Valid inputs
    - Invalid inputs (missing/incorrect fields)
    - Output structure matching response schema (status code-specific)

- The LLM should skip writing tests for event handlers if:
  - No summary is found in both event file and TRD.
  - These events should be listed in a `skippedTests` section at the end of this document.

## 6. Out of Scope
- Internal utility/helper functions
- End-to-end flows involving frontend or full stack
- Input schema validation (already enforced by Godspeed’s event schema)

## 7. EventsHandlers
- EventHandler1:
      - test1
      - test2
      - and so on...
- EventHandler2:
      - test1
      - test2
      - and so on...
and so on... for every function

## 8. Skipped Event Handlers
```

## Test Cases

* Agent correctly detects absence of `test-strat.md` and prompts user.
* Agent generates `test-strat.md` using template if user permits.
* Agent identifies event handlers in `src/events/` and creates test files for each.
* Tests include:

  * Valid input tests with correct response structure.
  * Invalid input tests handling edge cases or malformed inputs.
  * Response schema compliance checks.
* Agent logs skipped tests due to missing summaries in `test-strat.md`.
* Running `npm run test` executes generated tests without error.