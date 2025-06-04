import type { PlaywrightTestConfig } from '@playwright/test'

if (process.env.VERCEL) {
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
}

export default config
