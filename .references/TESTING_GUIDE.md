# Signup Form - UI Testing Guide

## Overview

This guide covers the comprehensive automated UI testing infrastructure for the signup form, which has been updated to use a single "name" field instead of separate first_name and last_name fields.

## Testing Stack

- **Framework**: Playwright Test
- **Language**: TypeScript
- **Pattern**: Page Object Model (POM)
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop + Mobile (iPhone 12, Pixel 5)

## Project Structure

```
tests/
├── e2e/
│   ├── signup.spec.ts          # Main test suite
│   ├── fixtures/
│   │   └── signup.ts           # Test data and fixtures
│   └── helpers/
│       └── signup-page.ts      # Page Object Model
playwright.config.ts             # Playwright configuration
```

## Setup and Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Install Dependencies

Playwright is already installed. If needed, install manually:

```bash
npm install -D @playwright/test
```

### Install Browsers

Playwright uses its own browser binaries. Install them with:

```bash
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Signup Tests Only

```bash
npm run test:signup
```

### Run Tests in UI Mode (Recommended for Development)

The UI mode provides an interactive test runner with step-by-step visualization:

```bash
npm run test:ui
```

Or for signup tests only:

```bash
npm run test:signup:ui
```

### Run Tests in Headed Mode

Run tests with visible browser windows:

```bash
npm run test:headed
```

### Debug Tests

Run tests with Playwright Inspector (step through code):

```bash
npm run test:debug
```

### View Test Report

Generate and view HTML test report:

```bash
npm run test:report
```

## Test Coverage

### Form Validation Tests (13 tests)

Tests verify that all client-side validation rules are enforced:

- Required field validation (club name, name, email, password fields)
- Email format validation
- Password requirements:
  - Minimum 8 characters
  - Uppercase letter required
  - Lowercase letter required
  - Number required
  - Special symbol required
- Password confirmation matching
- Terms and conditions acceptance
- Multiple simultaneous validation errors

**File**: `tests/e2e/signup.spec.ts` - "Signup Form - Validation" suite

### Successful Submission Tests (3 tests)

Tests verify successful form submission and user experience:

- Valid form submission without errors
- Loading state display during submission
- Submit button disabled during submission
- Valid email format acceptance

**File**: `tests/e2e/signup.spec.ts` - "Signup Form - Successful Submission" suite

### Edge Cases Tests (4 tests)

Tests verify handling of special characters and unusual inputs:

- Special characters in names (François, O'Brien, etc.)
- Very long names and club names
- Complex email formats (subdomains, plus addressing)
- Whitespace trimming

**File**: `tests/e2e/signup.spec.ts` - "Signup Form - Edge Cases" suite

### Accessibility Tests (6 tests)

Tests verify form accessibility for all users:

- Proper form labels and ARIA attributes
- Keyboard navigation support (Tab key)
- Required field indicators (asterisks)
- Descriptive error messages
- Proper heading hierarchy
- Focus management

**File**: `tests/e2e/signup.spec.ts` - "Signup Form - Accessibility" suite

### State and Behavior Tests (4 tests)

Tests verify form state management and user interactions:

- Error clearing on user input
- Form data preservation
- Navigation links functionality
- Page title and layout

**File**: `tests/e2e/signup.spec.ts` - "Signup Form - State and Behavior" suite

### Total: 30 Comprehensive Test Cases

## Form Field Reference

The signup form includes the following fields:

| Field | Type | Validation |
|-------|------|-----------|
| Club Name | Text Input | Required |
| Name | Text Input | Required, single field (not split) |
| Email | Email Input | Required, valid email format |
| Password | Password Input | Required, 8+ chars, uppercase, lowercase, number, symbol |
| Password Confirmation | Password Input | Required, must match password |
| Terms & Conditions | Checkbox | Required, must be checked |

## Test Data

Test fixtures are organized into three categories:

### Valid Data (`fixtures/signup.ts`)

```typescript
validSignupData = {
  clubName: 'Test Club',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'TestPass123!',
  passwordConfirmation: 'TestPass123!',
}
```

### Invalid Data (`fixtures/signup.ts`)

Includes test cases for:
- Missing required fields
- Invalid email formats
- Passwords that don't meet requirements
- Mismatched passwords

### Edge Cases (`fixtures/signup.ts`)

Includes test cases for:
- Special characters in names
- Very long inputs
- Complex email addresses
- Whitespace handling

## Page Object Model

The `SignupPage` class encapsulates all interactions with the signup form:

### Key Methods

```typescript
// Navigation
await signupPage.goto()

// Form input
await signupPage.fillClubName(value)
await signupPage.fillName(value)
await signupPage.fillEmail(value)
await signupPage.fillPassword(value)
await signupPage.fillPasswordConfirmation(value)
await signupPage.checkTerms()

// Submission
await signupPage.submit()
await signupPage.submitForm(data)

// Error checking
await signupPage.getNameErrorMessage()
await signupPage.hasNameError()

// State checking
await signupPage.isLoading()
await signupPage.getFormValues()
```

## Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Timeout**: 30 seconds per test
- **Retries**: 0 on local, 2 on CI
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop + Mobile variants
- **Artifacts**: Screenshots, videos, traces on failure

### Environment Variables

```bash
# Custom base URL
export PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173

# CI environment (enables retries)
export CI=true
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: UI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test
```

## Debugging

### View Failed Test Details

1. Run tests: `npm run test`
2. View report: `npm run test-report`
3. HTML report includes:
   - Screenshots before/after each step
   - Video recordings of failures
   - Full stack traces
   - Timeline of actions

### Use Playwright Inspector

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through test execution
- Inspect selectors
- Execute code in the console
- View DOM at each step

### Single Test Execution

```bash
npx playwright test tests/e2e/signup.spec.ts -g "should require name field"
```

## Best Practices

### Writing Tests

1. **Use Page Object Model**: All form interactions go through `SignupPage` class
2. **Meaningful Test Names**: Tests describe what they verify, not how
3. **Arrange-Act-Assert**: Clear test structure:
   ```typescript
   // Arrange
   await signupPage.goto();
   
   // Act
   await signupPage.fillSignupForm(invalidData);
   await signupPage.submit();
   
   // Assert
   expect(await signupPage.hasNameError()).toBe(true);
   ```

4. **Use Fixtures**: Reuse test data from `fixtures/signup.ts`
5. **Wait Strategically**: Use Playwright's auto-waiting, avoid hardcoded delays

### Selectors Strategy

Priority order (most to least stable):

1. **Role-based**: `getByRole('button', { name: 'Sign Up' })`
2. **Label-based**: `getByLabel('Email')`
3. **Placeholder**: `getByPlaceholder('Enter your email')`
4. **Test IDs**: `locator('[data-testid="signup-form"]')`
5. **CSS selectors**: Last resort only

### Flaky Test Prevention

- Use proper waits: `waitForLoadingComplete()`
- Avoid hard timeouts unless necessary
- Use specific assertions
- Check for element visibility before interaction
- Clear form data between tests with `beforeEach`

## Maintenance

### Updating Tests

When signup form changes:

1. Update `SignupPage` helper with new selectors
2. Update `fixtures/signup.ts` with new validation rules
3. Add new test cases for new features
4. Run full test suite: `npm run test`

### Adding New Tests

1. Add test case to appropriate suite in `signup.spec.ts`
2. Use existing fixtures or create new ones
3. Use `SignupPage` methods for interactions
4. Run tests: `npm run test:signup:ui`

## Troubleshooting

### Tests Fail to Start

```bash
# Ensure dev server is running
npm run dev

# Or let Playwright start it automatically
npm run test
```

### Timeout Errors

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### Selector Not Found

1. Run in UI mode: `npm run test:signup:ui`
2. Click the element in the browser
3. Inspect and update `SignupPage` helper

### Browser Crashes

Update Playwright:
```bash
npm install -D @playwright/test@latest
npx playwright install
```

## Performance Considerations

- Tests run in parallel by default (1 worker on CI)
- Each browser runs independently
- Typical full suite execution: 2-3 minutes
- UI mode for development, headless for CI

## Reporting and Metrics

### Test Report Includes

- Total tests, passed, failed, skipped
- Execution time per test
- Browser/device breakdown
- Screenshots/videos of failures
- Test timeline with step details

### View Latest Report

```bash
npm run test:report
```

## Key Features of This Test Suite

1. **Comprehensive Coverage**: 30 test cases covering all user scenarios
2. **Single Name Field**: Tests updated for new single "name" field implementation
3. **Accessibility First**: 6 dedicated accessibility tests
4. **Page Object Model**: Maintainable, scalable test structure
5. **Multiple Browsers**: Desktop Chrome, Firefox, Safari + Mobile
6. **Real-World Scenarios**: Tests actual user workflows
7. **Error Handling**: Comprehensive validation and error message testing
8. **Edge Cases**: Special characters, long inputs, complex emails
9. **Type Safe**: Full TypeScript support
10. **CI Ready**: Configured for GitHub Actions and other CI systems

## Quick Reference

```bash
# Start testing
npm run test:signup:ui

# Run all tests
npm run test

# View results
npm run test:report

# Debug specific test
npm run test:debug

# Help
npx playwright --help
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-page)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For issues or questions about the test suite:

1. Check test output and error messages
2. Review the test code and comments
3. Use `npm run test:debug` to step through tests
4. Check Playwright documentation
5. Review `SignupPage` helper methods

