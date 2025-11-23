# Setup Verification Checklist

Use this checklist to verify all components are correctly installed and configured.

## Files Created

### Signup Form Component

- [x] `/app/pages/signup.vue` - Updated with single name field
  ```bash
  ls -lh /web/app/pages/signup.vue
  ```

### Playwright Configuration

- [x] `playwright.config.ts` - Test framework configuration
  ```bash
  ls -lh /web/playwright.config.ts
  ```

### Test Files

- [x] `tests/e2e/signup.spec.ts` - 30 test cases

  ```bash
  wc -l /web/tests/e2e/signup.spec.ts
  ```

  Expected: ~700+ lines

- [x] `tests/e2e/helpers/signup-page.ts` - Page Object Model

  ```bash
  wc -l /web/tests/e2e/helpers/signup-page.ts
  ```

  Expected: ~300+ lines

- [x] `tests/e2e/fixtures/signup.ts` - Test data
  ```bash
  wc -l /web/tests/e2e/fixtures/signup.ts
  ```
  Expected: ~150+ lines

### Documentation Files

- [x] `TESTING_QUICKSTART.md` - Quick start guide

  ```bash
  ls -lh /web/TESTING_QUICKSTART.md
  ```

- [x] `TESTING_GUIDE.md` - Comprehensive guide

  ```bash
  ls -lh /web/TESTING_GUIDE.md
  ```

- [x] `TEST_COVERAGE.md` - Coverage report

  ```bash
  ls -lh /web/TEST_COVERAGE.md
  ```

- [x] `TESTING_IMPLEMENTATION_SUMMARY.md` - This summary
  ```bash
  ls -lh /web/TESTING_IMPLEMENTATION_SUMMARY.md
  ```

## Dependencies

### Playwright Installation

Check that Playwright is installed:

```bash
npm list @playwright/test
# Should show: @playwright/test@^1.56.1
```

### Browsers Installed

Install Playwright browsers:

```bash
npx playwright install
```

Verify installation:

```bash
npx playwright install --dry-run
# Should list: chromium, firefox, webkit
```

## Package.json Updates

Verify test scripts are added:

```bash
grep -A 7 '"test"' /web/package.json
```

Expected scripts:

```json
"test": "playwright test",
"test:ui": "playwright test --ui",
"test:headed": "playwright test --headed",
"test:debug": "playwright test --debug",
"test:signup": "playwright test tests/e2e/signup.spec.ts",
"test:signup:ui": "playwright test tests/e2e/signup.spec.ts --ui",
"test:report": "playwright show-report"
```

## Signup Form Verification

### Name Field Implementation

Check single name field is in place:

```bash
grep "v-model=\"name\"" /web/app/pages/signup.vue
# Should find: 1 match
```

Check name field is used in validation:

```bash
grep "formData.name" /web/app/pages/signup.vue
# Should find: 4 matches
```

Check old firstName/lastName fields are removed:

```bash
grep "firstName\|lastName" /web/app/pages/signup.vue
# Should find: 0 matches
```

## Test Files Verification

### Syntax Check (TypeScript)

```bash
npx tsc --noEmit tests/e2e/signup.spec.ts
# Should have no errors
```

### Test Count

```bash
grep -c "test(" /web/tests/e2e/signup.spec.ts
# Should show: 30
```

### Test Categories

```bash
grep "test.describe(" /web/tests/e2e/signup.spec.ts
# Should show: 5 suites
```

## Environment Setup

### Node Version

```bash
node --version
# Should be 18.x or higher
```

### npm Version

```bash
npm --version
# Should be 9.x or higher
```

### Git Status

```bash
cd /web
git status
# Should show modified app/pages/signup.vue and package.json
# Should show new test files
```

## First Test Run

### Start Dev Server

```bash
npm run dev
# Should start on http://localhost:3000
```

### Run Tests

In another terminal:

```bash
npm run test:signup
# Should run 30 tests
# Expected: All tests pass (may fail if API not mocked)
```

### Success Indicators

- Tests execute without syntax errors
- Loading states appear/disappear correctly
- Form validation works as expected
- No timeout errors

## Configuration Verification

### Playwright Config

Check configuration file:

```bash
grep -E "baseURL|timeout|workers" /web/playwright.config.ts
# Should show baseURL, timeout, and workers settings
```

### Test Base URL

Default: `http://localhost:3000`

Override with environment variable:

```bash
export PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173
npm run test
```

## Documentation Verification

### Quick Start (5 min read)

```bash
wc -l /web/TESTING_QUICKSTART.md
# Expected: 200+ lines
```

### Full Guide (30 min read)

```bash
wc -l /web/TESTING_GUIDE.md
# Expected: 400+ lines
```

### Coverage Report

```bash
wc -l /web/TEST_COVERAGE.md
# Expected: 300+ lines
```

## Common Issues & Fixes

### Issue: Tests won't start

**Fix**: Make sure dev server is running

```bash
npm run dev  # In one terminal
npm run test # In another terminal
```

### Issue: Browser crashes

**Fix**: Reinstall Playwright

```bash
npm install -D @playwright/test@latest
npx playwright install
```

### Issue: Selector not found

**Fix**: Use interactive mode

```bash
npm run test:signup:ui
# Click on element in test runner
```

### Issue: Timeout errors

**Fix**: Increase timeout in playwright.config.ts

```typescript
timeout: 60 * 1000,  // 60 seconds
```

## Post-Setup Checklist

- [ ] All files created (test files + documentation)
- [ ] Playwright installed and browsers installed
- [ ] Dev server starts without errors
- [ ] Tests run without syntax errors
- [ ] Test report generates successfully
- [ ] UI mode works interactively
- [ ] All 30 tests are discoverable
- [ ] Name field successfully replaces firstName/lastName
- [ ] Documentation is readable and clear
- [ ] Test fixtures have realistic data

## Integration Steps

### Add to Git

```bash
git add app/pages/signup.vue
git add tests/
git add playwright.config.ts
git add TESTING_*.md
git add setup_verification_checklist.md
git commit -m "feat(testing): add comprehensive signup form test suite"
```

### Set Up Pre-Commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run test:signup || exit 1
```

### CI/CD Pipeline

Add to GitHub Actions or other CI:

```yaml
- run: npm run test
```

## Quick Commands Reference

```bash
# Development
npm run test:signup:ui      # Interactive mode
npm run test:headed         # See browser
npm run test:debug          # Step through

# Verification
npm run test:signup         # Run signup tests
npm run test                # Run all tests
npm run test:report         # View results

# Setup
npx playwright install      # Install browsers
npm install                 # Install dependencies
```

## Support Resources

1. **Stuck on setup?**
   - Read: TESTING_QUICKSTART.md

2. **Need details?**
   - Read: TESTING_GUIDE.md

3. **Want coverage info?**
   - Read: TEST_COVERAGE.md

4. **Have test questions?**
   - Check test file comments
   - Review SignupPage helper
   - Review test fixtures

5. **Official docs?**
   - https://playwright.dev
   - https://playwright.dev/docs/test-configuration

## Final Verification

Run this command to verify everything:

```bash
#!/bin/bash
echo "Checking files..."
ls -q tests/e2e/*.ts tests/e2e/**/*.ts 2>/dev/null | wc -l  # Should be 3
echo "Checking dependencies..."
npm list @playwright/test
echo "Checking documentation..."
ls -1 TESTING_*.md TEST_*.md 2>/dev/null | wc -l  # Should be 4
echo "Checking form update..."
grep -c "v-model=\"name\"" app/pages/signup.vue  # Should be 1
echo "All checks complete!"
```

Expected output:

```
Checking files...
3
Checking dependencies...
@playwright/test@1.56.1
Checking documentation...
4
Checking form update...
1
All checks complete!
```

## You're Ready!

All components are installed and configured. Start testing:

```bash
npm run test:signup:ui
```

Refer to documentation as needed. Happy testing!
