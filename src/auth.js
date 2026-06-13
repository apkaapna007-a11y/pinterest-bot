const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const SESSION_FILE = path.join(__dirname, 'session.json');

async function getBrowser(isHeadless) {
  return await chromium.launch({
    headless: isHeadless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
}

async function getContext(browser) {
  if (fs.existsSync(SESSION_FILE)) {
    logger.info('Found existing session. Loading...');
    return await browser.newContext({
      storageState: SESSION_FILE,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
  }
  
  logger.info('No existing session found. Creating new context.');
  return await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
}

async function login(page, email, password) {
  logger.info('Navigating to Pinterest login...');
  await page.goto('https://www.pinterest.com/login/', { waitUntil: 'networkidle' });

  // Wait for email input
  await page.waitForSelector('input[name="id"]', { timeout: 15000 });
  
  logger.info('Entering credentials...');
  await page.fill('input[name="id"]', email);
  await page.click('button[type="submit"]');
  
  // Wait for password input (Pinterest uses a multi-step login)
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  logger.info('Waiting for login to complete. If you have 2FA, please complete it in the browser now.');
  
  // Wait until we are redirected away from the login page
  await page.waitForURL('https://www.pinterest.com/**', { timeout: 120000 });
  
  logger.info('Login successful! Saving session state...');
  await page.context().storageState({ path: SESSION_FILE });
  logger.info('Session saved to session.json. Future runs will skip login.');
}

async function ensureAuthenticated(browser, email, password, isHeadless) {
  const context = await getContext(browser);
  const page = await context.newPage();
  
  // Check if already logged in by checking for a logged-in element
  await page.goto('https://www.pinterest.com/', { waitUntil: 'networkidle' });
  
  const isLoggedIn = await page.$('div[data-test-id="profile-dropdown"]') !== null;
  
  if (!isLoggedIn) {
    logger.warn('Not authenticated. Initiating login flow...');
    if (isHeadless) {
      logger.error('Cannot perform interactive login in headless mode. Set HEADLESS=false in .env for the first run.');
      throw new Error('Authentication failed: Headless mode active.');
    }
    await login(page, email, password);
  } else {
    logger.info('Already authenticated via saved session.');
  }
  
  return { context, page };
}

module.exports = { getBrowser, ensureAuthenticated, SESSION_FILE };
