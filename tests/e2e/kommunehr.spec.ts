import { expect, test } from '@playwright/test';

test('can ask about ferie and receive structured answer', async ({ page }) => {
  await page.goto('/chat');
  await page.getByLabel('Skriv HR-spørsmål').fill('Hvor mye ferie kan jeg kreve å ta sammenhengende?');
  await page.getByRole('button', { name: 'Send spørsmål' }).click();

  await expect(page.getByText('Kort svar')).toBeVisible();
  await expect(page.getByText('Kildegrunnlag')).toBeVisible();
});

test('supports sector selection for helse og velferd', async ({ page }) => {
  await page.goto('/chat');
  await page.getByLabel('Sektor').selectOption('helse-velferd');
  await page.getByLabel('Skriv HR-spørsmål').fill('Er det lov å pålegge overtid i turnus?');
  await page.getByRole('button', { name: 'Send spørsmål' }).click();

  await expect(
    page.getByText(/I helse og velferd bør du kontrollere bemanningsbehov/i)
  ).toBeVisible();
});

test('high-risk personnel issue is escalated in the UI', async ({ page }) => {
  await page.goto('/chat');
  await page.getByLabel('Skriv HR-spørsmål').fill('Hvordan håndterer jeg en konflikt og mulig trakassering?');
  await page.getByRole('button', { name: 'Send spørsmål' }).click();

  await expect(page.getByText('Denne saken bør løftes videre')).toBeVisible();
  await expect(page.getByText(/juridisk rådgiver/i)).toBeVisible();
});

test('admin update is reflected in escalation contact information', async ({ page }) => {
  await page.goto('/admin');
  const hrInput = page.getByLabel('HR-kontakt');
  await hrInput.fill('hr-ny@kommune.no');
  await expect(hrInput).toHaveValue('hr-ny@kommune.no');

  await page.goto('/chat');
  await page.getByLabel('Skriv HR-spørsmål').fill('Hvordan håndterer jeg en konflikt og mulig trakassering?');
  await page.getByRole('button', { name: 'Send spørsmål' }).click();

  await expect(page.getByText('HR: hr-ny@kommune.no')).toBeVisible();
});

test('role switching updates the session banner', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Rolle').selectOption('leder');

  await expect(page.getByText(/Rolle: LEDER via mock/i)).toBeVisible();
});

test('knowledge page shows ingest-backed source summaries', async ({ page }) => {
  await page.goto('/knowledge');

  await expect(page.getByText('Ingest-kilder')).toBeVisible();
  await expect(page.getByText(/Interne rutiner og personalhåndbok/i)).toBeVisible();
});
