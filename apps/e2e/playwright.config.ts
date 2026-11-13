import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const FRONTEND_URL =
  process.env.FRONTEND_URL ?? 'https://amauta.diazignacio.ar';
const API_URL = process.env.API_URL ?? 'https://amauta-api.diazignacio.ar';
const PLAYWRIGHT_EXECUTABLE_PATH = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(PLAYWRIGHT_EXECUTABLE_PATH
      ? { launchOptions: { executablePath: PLAYWRIGHT_EXECUTABLE_PATH } }
      : {}),
  },

  projects: [
    {
      name: 'frontend',
      testDir: './tests/frontend',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: FRONTEND_URL,
        ...(PLAYWRIGHT_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: PLAYWRIGHT_EXECUTABLE_PATH } }
          : {}),
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_URL,
        ...(PLAYWRIGHT_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: PLAYWRIGHT_EXECUTABLE_PATH } }
          : {}),
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});

export { API_URL, FRONTEND_URL };
