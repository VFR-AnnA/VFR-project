import { test, expect } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

test('Try-on flow enables add to cart', async ({ page }) => {
  await page.goto(`${baseURL}/product/hoodie`)
  await page.getByText('Try It On First').click()
  await page.waitForSelector('#vfr-slot iframe')
  await page.evaluate(() => {
    window.postMessage({ type: 'vfr-fit', ok: true }, '*')
  })
  const addBtn = page.getByRole('button', { name: 'Add to Cart' })
  await expect(addBtn).toBeEnabled()
})
