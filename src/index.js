require('dotenv').config();
const logger = require('./logger');
const { getBrowser, ensureAuthenticated } = require('./auth');
const { runEngagementLoop } = require('./actions');

async function main() {
  logger.info('🚀 Starting Pinterest Bot v2.1.0 (Stealth Enhanced)');
  
  // Validate environment variables
  if (!process.env.PINTEREST_EMAIL || !process.env.PINTEREST_PASSWORD) {
    logger.error('Missing PINTEREST_EMAIL or PINTEREST_PASSWORD in .env file.');
    logger.info('Please copy .env.example to .env and fill in your credentials.');
    process.exit(1);
  }

  const config = {
    actionLike: process.env.ACTION_LIKE === 'true',
    actionSave: process.env.ACTION_SAVE === 'true',
    actionFollow: process.env.ACTION_FOLLOW === 'true',
    maxLikes: parseInt(process.env.MAX_LIKES_PER_SESSION, 10) || 30,
    maxSaves: parseInt(process.env.MAX_SAVES_PER_SESSION, 10) || 20,
    maxFollows: parseInt(process.env.MAX_FOLLOWS_PER_SESSION, 10) || 15,
    minDelayBetweenActions: parseInt(process.env.MIN_DELAY_BETWEEN_ACTIONS, 10) || 3000,
    maxDelayBetweenActions: parseInt(process.env.MAX_DELAY_BETWEEN_ACTIONS, 10) || 8000,
    minDelayBetweenPages: parseInt(process.env.MIN_DELAY_BETWEEN_PAGES, 10) || 10000,
    maxDelayBetweenPages: parseInt(process.env.MAX_DELAY_BETWEEN_PAGES, 10) || 20000,
  };

  logger.info('Configuration loaded. Safety limits applied.');

  let browser;
  try {
    const isHeadless = process.env.HEADLESS === 'true';
    logger.info(`Launching browser (Headless: ${isHeadless})...`);
    
    browser = await getBrowser(isHeadless);
    const { context, page } = await ensureAuthenticated(
      browser, 
      process.env.PINTEREST_EMAIL, 
      process.env.PINTEREST_PASSWORD,
      isHeadless
    );

    logger.info('Browser ready with advanced stealth evasion. Beginning engagement loop...');
    await runEngagementLoop(page, config);

  } catch (error) {
    logger.error('An error occurred during bot execution:', error.message);
  } finally {
    if (browser) {
      logger.info('Closing browser...');
      await browser.close();
    }
    logger.info('🏁 Bot session finished.');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

main();
