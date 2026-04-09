import { test, expect } from '@playwright/test';

const REGISTER_URL = '/investor/register';
const API_PREFIX = '**/api/clients/**';

function setupApiMocks(route: any) {
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
    return route.fulfill({ status: 200, body: JSON.stringify('202501011001') });
  }
  if (url.includes('onboarding/register/step1/') && method === 'POST') {
    return route.fulfill({ status: 200, body: JSON.stringify({ message: 'OTP sent', emailSent: true, smsSent: false, expiresInMinutes: 15 }) });
  }
  if (url.includes('step2/verify-otp') && method === 'POST') {
    return route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'OK', investorId: 1, uniqueCode: '202501011001' }) });
  }
  if (url.includes('onboarding/register/step3/') && method === 'POST') {
    return route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'Registration completed', investorId: 1 }) });
  }
  return route.continue();
}

test.describe('Individual Self-Registration flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(API_PREFIX, setupApiMocks);
  });

  test('step 1: shows Basic Information and Individual option', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await expect(page.getByRole('heading', { name: /Investor Registration/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Basic Information/i })).toBeVisible();
    await expect(page.getByLabel(/Full Name \*/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /Register As \*/i })).toHaveValue('1');
  });

  test('step 1: validation - cannot proceed without full name', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByLabel(/Full Name \*/i)).toBeVisible();
  });

  test('step 1: valid individual data advances to step 2', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByPlaceholder(/Enter your full name/i).fill('Test Individual');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Personal Details/i })).toBeVisible({ timeout: 5000 });
  });

  test('full individual flow: step 1 to step 4 then complete', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByPlaceholder(/Enter your full name/i).fill('E2E Individual');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: /Personal Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('E2E');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('User');
    await page.getByLabel(/Email ID \*/i).fill('e2e-individual@example.com');
    await page.getByLabel(/Mobile Number \*/i).fill('9876543210');
    await page.getByRole('button', { name: /Send OTP/i }).click();

    await expect(page.getByRole('heading', { name: /Verify OTP & Set Password/i })).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Enter 4-digit OTP/).fill('1111');
    await page.getByLabel(/Password \*/i).fill('TestPassword1!');
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

  test('individual - market other than India', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByPlaceholder(/Enter your full name/i).fill('International User');
    await page.getByRole('combobox', { name: /Market \*/i }).selectOption('2');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Personal Details/i })).toBeVisible({ timeout: 5000 });
  });

  test('individual - India market no PAN', async ({ page }) => {
    await page.goto(REGISTER_URL);
    await page.getByPlaceholder(/Enter your full name/i).fill('No Pan User');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: /Personal Details/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('combobox', { name: /Title \*/i }).selectOption('1');
    await page.getByPlaceholder(/As per government ID/).first().fill('NoPan');
    await page.getByPlaceholder(/As per government ID/).nth(1).fill('User');
    await page.getByLabel(/Email ID \*/i).fill('nopan@example.com');
    await page.getByLabel(/Mobile Number \*/i).fill('9876500000');
    await page.getByRole('button', { name: /Send OTP/i }).click();
    await expect(page.getByRole('heading', { name: /Verify OTP & Set Password/i })).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Enter 4-digit OTP/).fill('1111');
    await page.getByLabel(/Password \*/i).fill('TestPassword1!');
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
});
