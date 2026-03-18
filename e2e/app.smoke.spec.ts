import { expect, test } from '@playwright/test'

test('quick add and complete a task', async ({ page }) => {
  await page.goto('/today')

  await page.getByPlaceholder('Add a task').fill('Smoke test quest')
  await page.keyboard.press('Enter')

  await expect(page.getByText('Smoke test quest')).toBeVisible()
  await page.getByRole('button', { name: 'Mark done' }).first().click()

  await expect(page.getByRole('heading', { name: 'Claimed today' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remove' }).first()).toBeVisible()
})

test('add a reward and show insufficient coin state', async ({ page }) => {
  await page.goto('/rewards')

  await page.getByLabel('Reward').fill('Coffee out')
  await page.getByLabel('Coin cost').fill('12')
  await page.getByRole('button', { name: 'Add reward' }).click()

  await expect(page.getByText('Coffee out')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Need more coins' }).first()).toBeDisabled()
})
