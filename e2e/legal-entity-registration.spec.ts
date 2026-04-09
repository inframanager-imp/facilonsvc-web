import { test, expect } from '@playwright/test';

const REGISTER_URL = '/investor/register';
const API_PREFIX = '**/api/clients/**';

test.describe('Legal Entity Self-Registration flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(API_PREFIX, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      if (url.includes('/content/') && method === 'GET') {
        if (url.includes('countries')) {
          return route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, ssName: 'India', ssIsdCode: '91' }, { id: 2, ssName: 'USA', ssIsdCode: '1' }]) });
        }
        if (url.includes('titles')) {
          return route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, ssName: 'Mr.' }, { id: 2, ssName: 'Ms.' }]) });
        }
        if (url.includes('genders')) {
          return route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, ssName: 'Male' }, { id: 2, ssName: 'Female' }]) });
        }
        if (url.includes('market-types')) {
          return route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, marketName: 'India' }, { id: 2, marketName: 'International' }]) });
        }
        if (url.includes('nationalities')) {
          return route.fulfill({ status: 200, body: JSON.stringify([{ id: 1, name: 'Indian' }, { id: 2, name: 'American' }]) });
        }
      }
      if (url.includes('onboarding/register/main-step') && method === 'POST') {
        return route.fulfill({ status: 200, body: JSON.stringify('202501019999') });
      }
      if (url.includes('onboarding/register/step1/') && method === 'POST') {
        return route.fulfill({ status: 200, body: JSON.stringify({ message: 'OTP sent', emailSent: true, smsSent: false, expiresInMinutes: 15 }) });
      }
      if (url.includes('step2/verify-otp') && method === 'POST') {
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'OK', investorId: 2, uniqueCode: '202501019999' }) });
      }
      if (url.includes('onboarding/register/step3/') && method === 'POST') {
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'Registration completed', investorId: 2 }) });
      }
      return route.continue();
    });
  });

  test('step 1: switching to Legal Entity shows entity fields', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await expect(page.getByLabel(/Legal Entity Name \*/i)).toBeVisible();
    await expect(page.getByLabel(/Country of Incorporation \*/i)).toBeVisible();
    await expect(page.getByLabel(/Country of Tax Residency \*/i)).toBeVisible();
    await expect(page.getByLabel(/Legal Entity Website/i)).toBeVisible();
  });

  test('step 1: legal entity validation - requires incorporation and tax residency', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('Acme Corp');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByLabel(/Country of Incorporation \*/i)).toBeVisible();
  });

  test('step 1: legal entity - invalid website format blocks submit', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('Acme Corp');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByPlaceholder(/www.example.com/i).fill('invalid-url');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByLabel(/Legal Entity Name \*/i)).toBeVisible();
  });

  test('step 1: valid legal entity with www website advances to step 2', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('Acme Corp');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
  });

  test('step 2: legal entity shows capacity field', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('Acme');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/Capacity Representing the Legal Entity/i)).toBeVisible();
  });

  test('step 2: legal entity rejects gmail and blocks OTP send', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('Acme');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('John');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('Director');
    await page.getByLabel(/Email ID \*/i).fill('john@gmail.com');
    await page.getByLabel(/Mobile Number \*/i).fill('9876543210');
    await page.getByRole('button', { name: /Send OTP/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible();
  });

  test('full legal entity flow: corporate email and complete registration', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('E2E Legal Corp');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByPlaceholder(/www.example.com/i).fill('www.e2elegal.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('E2E');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('Director');
    await page.getByLabel(/Email ID \*/i).fill('e2e@legalcorp.com');
    await page.getByLabel(/Mobile Number \*/i).fill('9876543210');
    await page.getByRole('combobox', { name: /Capacity Representing the Legal Entity/i }).selectOption('Director');
    await page.getByRole('button', { name: /Send OTP/i }).click();

    await expect(page.getByRole('heading', { name: /Verify OTP & Set Password/i })).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Enter 4-digit OTP/).fill('1111');
    await page.getByLabel(/Password \*/i).fill('LegalEntity1!');
    await page.getByRole('button', { name: /Verify & Continue/i }).click();

    await expect(page.getByLabel(/Citizenship \*/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Citizenship \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Residence \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Nationality \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Do you have a PAN Card/i }).selectOption('yes');
    await page.getByRole('checkbox', { name: /information provided is correct/i }).check();
    await page.getByRole('checkbox', { name: /Privacy Policy/i }).check();
    await page.getByRole('checkbox', { name: /receive notifications from Facilon/i }).check();
    await page.getByRole('button', { name: /Complete Registration/i }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('legal entity - India market no PAN', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('No Pan Entity');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('Entity');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('Rep');
    await page.getByLabel(/Email ID \*/i).fill('rep@nopanentity.com');
    await page.getByLabel(/Mobile Number \*/i).fill('9876500001');
    await page.getByRole('button', { name: /Send OTP/i }).click();
    await expect(page.getByRole('heading', { name: /Verify OTP & Set Password/i })).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Enter 4-digit OTP/).fill('1111');
    await page.getByLabel(/Password \*/i).fill('EntityPass1!');
    await page.getByRole('button', { name: /Verify & Continue/i }).click();
    await expect(page.getByLabel(/Citizenship \*/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Do you have a PAN Card/i }).selectOption('no');
    await page.getByRole('combobox', { name: /Citizenship \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Residence \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Nationality \*/i }).selectOption('1');
    await page.getByRole('checkbox', { name: /information provided is correct/i }).check();
    await page.getByRole('checkbox', { name: /Privacy Policy/i }).check();
    await page.getByRole('checkbox', { name: /receive notifications from Facilon/i }).check();
    await page.getByRole('button', { name: /Complete Registration/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('legal entity - step 4 shows optional WhatsApp consent', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('combobox', { name: /Register As \*/i }).selectOption('2');
    await page.getByPlaceholder(/Enter legal entity name/i).fill('W');
    await page.getByRole('combobox', { name: /Country of Incorporation \*/i }).selectOption('1');
    await page.getByRole('combobox', { name: /Country of Tax Residency \*/i }).selectOption('1');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Authorized Representative Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('W');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('W');
    await page.getByLabel(/Email ID \*/i).fill('w@company.org');
    await page.getByLabel(/Mobile Number \*/i).fill('9876599999');
    await page.getByRole('button', { name: /Send OTP/i }).click();
    await expect(page.getByRole('heading', { name: /Verify OTP & Set Password/i })).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Enter 4-digit OTP/).fill('1111');
    await page.getByLabel(/Password \*/i).fill('WhatsApp1!');
    await page.getByRole('button', { name: /Verify & Continue/i }).click();
    await expect(page.getByLabel(/Citizenship \*/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/WhatsApp.*Optional for corporate/i)).toBeVisible();
  });
});
