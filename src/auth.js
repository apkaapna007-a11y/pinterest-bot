const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Apply stealth plugin to playwright-extra
chromium.use(stealth);

// Define persistent browser profile directory
const USER_DATA_DIR = path.join(__dirname, '..', 'browser-profile');

async function getAuthenticatedContext(isHeadless, email, password) {
  // Ensure the profile directory exists
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    logger.info(`Created new persistent browser profile directory at: ${USER_DATA_DIR}`);
  } else {
    logger.info(`Using existing persistent browser profile at: ${USER_DATA_DIR}`);
  }

  const contextOptions = {
    headless: isHeadless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,800'
    ],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation', 'notifications'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
    }
  };

  logger.info('Launching browser with full persistent profile (cookies, cache, history, IndexedDB)...');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, contextOptions);
  
  // Get the default page or create a new one
  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // Check if we need to log in
  logger.info('Checking authentication status...');
  await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // Let the page settle
  
  const isLoggedIn = await page.$('div[data-test-id="profile-dropdown"]') !== null;
  
  if (!isLoggedIn) {
    logger.warn('Not authenticated in persistent profile. Initiating login flow...');
    if (isHeadless) {
      logger.error('Cannot perform interactive login in headless mode. Set HEADLESS=false in .env for the first run.');
      throw new Error('Authentication failed: Headless mode active.');
    }
    await login(page, email, password);
  } else {
    logger.info('✅ Already authenticated via persistent browser profile.');
  }
  
  return { context, page };
}

async function login(page, email, password) {
  logger.info('Navigating to Pinterest login...');
  await page.goto('https://www.pinterest.com/login/', { waitUntil: 'domcontentloaded' });

  // Wait for email input
  await page.waitForSelector('input[name="id"]', { timeout: 15000 });
  
  logger.info('Entering credentials...');
  // Human-like typing delay
  await page.locator('input[name="id"]').click();
  await page.keyboard.type(email, { delay: 100 }); 
  await page.locator('button[type="submit"]').click();
  
  // Wait for password input (Pinterest uses a multi-step login)
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  await page.locator('input[name="password"]').click();
  await page.keyboard.type(password, { delay: 120 });
  await page.locator('button[type="submit"]').click();

  logger.info('Waiting for login to complete. If you have 2FA, please complete it in the browser now.');
  
  // Wait until we are redirected away from the login page
  await page.waitForURL('https://www.pinterest.com/**', { timeout: 120000 });
  
  logger.info('✅ Login successful! Profile data (including 2FA tokens) is automatically saved to the browser-profile directory.');
}

module.exports = { getAuthenticatedContext };
