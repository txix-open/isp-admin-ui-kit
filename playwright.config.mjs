import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    actionTimeout: 8000,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'unit', testMatch: '*.test.mjs' },
    { name: 'regression', testMatch: '**/*.regression.spec.mjs' },
    {
      name: 'desktop',
      testMatch: '**/admin-layout.spec.mjs',
      use: { viewport: { width: 1440, height: 900 } }
    },
    {
      name: 'narrow',
      testMatch: '**/admin-layout.spec.mjs',
      use: { viewport: { width: 375, height: 812 }, colorScheme: 'dark' }
    }
  ]
})
