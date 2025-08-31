// @ts-check
import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://app.nioxtec.es';
const STORAGE = process.env.STORAGE || 'auth.json';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: BASE_URL,
    storageState: STORAGE,
    headless: true,
  },
  reporter: 'list',
});

