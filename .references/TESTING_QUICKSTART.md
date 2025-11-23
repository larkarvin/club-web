# Testing Quick Start Guide

## 5-Minute Setup

### 1. Install Browsers

```bash
npx playwright install
```

### 2. Run Tests with UI

```bash
npm run test:signup:ui
```

The UI will open in your browser with interactive test visualization.

## Common Commands

| Task | Command | Output |
|------|---------|--------|
| Run all tests | `npm run test` | Pass/fail summary |
| Run signup tests | `npm run test:signup` | Signup tests only |
| Interactive mode | `npm run test:ui` | Click to run tests step-by-step |
| View reports | `npm run test:report` | HTML report in browser |
| Debug tests | `npm run test:debug` | Step through with inspector |
| Visible browsers | `npm run test:headed` | See browser automation |

## First Test Run

```bash
# Start dev server in one terminal
npm run dev

# Run tests in another
npm run test:signup
```

Expected output:
```
30 passed (25s)
```

## Understanding Test Output

### Passing Tests
```
✓ should display all required form fields (5s)
✓ should require name field (3s)
```

### Failed Tests
```
✗ should require name field (3s)
Error: expected 'null' to be truthy
```

View details in HTML report:
```bash
npm run test:report
```

## Writing Your First Test

Add to `tests/e2e/signup.spec.ts`:

```typescript
test('should accept valid data', async () => {
  await signupPage.goto();
  await signupPage.fillSignupForm({
    clubName: 'My Club',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'TestPass123!',
    passwordConfirmation: 'TestPass123!',
  });
  await signupPage.checkTerms();
  await signupPage.submit();
  // Add assertion here
});
```

## Test File Structure

```typescript
import { test, expect } from '@playwright/test';
import { SignupPage } from './helpers/signup-page';

test.describe('Signup Form', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
  });

  test('should do something', async () => {
    // Arrange - set up test
    // Act - perform actions
    // Assert - check results
  });
});
```

## Common Assertions

```typescript
// Check element visible
await expect(signupPage.nameInput).toBeVisible();

// Check text content
const error = await signupPage.getNameErrorMessage();
expect(error).toContain('required');

// Check element has class
await expect(signupPage.submitButton).toHaveClass(/disabled/);

// Check element count
const errors = await page.locator('[class*="text-red"]').count();
expect(errors).toBeGreaterThan(0);
```

## Using Page Object Model

The `SignupPage` class simplifies form interactions:

```typescript
// Good - uses helper
await signupPage.fillName('John');
await signupPage.submit();

// Bad - direct selectors
await page.locator('input#name').fill('John');
await page.locator('button[type=submit]').click();
```

Available methods:
- `fillClubName()`, `fillName()`, `fillEmail()`, `fillPassword()`
- `checkTerms()`, `submit()`
- `getNameErrorMessage()`, `hasNameError()`
- `isLoading()`, `getFormValues()`

## Debugging

### Run Single Test

```bash
npx playwright test signup.spec.ts -g "should require name"
```

### Debug Mode

```bash
npm run test:debug
```

Then:
- Click "Step over" to progress
- Hover over variables in code
- Use console to inspect DOM

### View Test Step Details

```bash
npm run test:headed
```

Watch browser perform actions in real-time.

## Test Data

Pre-made data sets in `fixtures/signup.ts`:

```typescript
import {
  validSignupData,
  invalidSignupData,
  edgeCaseSignupData,
} from './fixtures/signup';

// Use valid data
await signupPage.submitForm({
  ...validSignupData,
  agreeToTerms: true,
});

// Use invalid data
await signupPage.fillSignupForm(
  invalidSignupData.noName
);
```

## Troubleshooting

### Tests won't start
```bash
# Make sure dev server is running
npm run dev

# Or run both
npm run test  # Starts dev server automatically
```

### Element not found
```bash
# Use debug mode to inspect
npm run test:debug

# Or check the selector
await page.pause();  // Pauses test, inspect in console
```

### Timeout errors
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### Tests pass locally but fail in CI
- Use `npm run test:headed` to see what's different
- Check base URL matches: `PLAYWRIGHT_TEST_BASE_URL`
- Ensure dev server starts before tests

## Tips & Tricks

### Stop at Failure
```bash
npx playwright test --fail-on-console-error
```

### Run Single Browser
```bash
npx playwright test --project=chromium
```

### Generate Test
```bash
npx playwright codegen http://localhost:3000
```

Opens browser to record actions automatically.

### Screenshot on Demand
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Disable Parallelization
```bash
npx playwright test --workers=1
```

## Next Steps

1. Read [TESTING_GUIDE.md](./TESTING_GUIDE.md) for full documentation
2. Review [TEST_COVERAGE.md](./TEST_COVERAGE.md) for coverage details
3. Explore [SignupPage helper](./tests/e2e/helpers/signup-page.ts)
4. Check [test fixtures](./tests/e2e/fixtures/signup.ts)
5. Run the full test suite: `npm run test`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Examples](./tests/e2e/signup.spec.ts)
- [Playwright Inspector](https://playwright.dev/docs/debug)
- [Best Practices](https://playwright.dev/docs/best-practices)

