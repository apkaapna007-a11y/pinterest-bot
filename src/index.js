require('dotenv').config();
const logger = require('./logger');
const { getAuthenticatedContext } = require('./auth');
const { runEngagementLoop } = require('./actions');

async function main() {
  logger.info('🚀 Starting Pinterest Bot v2.2.0 (Persistent Profile + Keyword Targeting)');
  
  // Validate environment variables
  if (!process.env.PINTEREST_EMAIL || !process.env.PINTEREST_PASSWORD) {
    logger.error('❌ Missing PINTEREST_EMAIL or PINTEREST_PASSWORD in .env file.');
    logger.info('Please copy .env.example to .env and fill in your credentials.');
    process.exit(1);
  }

  // Parse keywords from .env
  let keywords = [];
  if (process.env.TARGET_KEYWORDS) {
    keywords = process.env.TARGET_KEYWORDS.split(',').map(k => k.trim()).filter(k => k.length > 0);
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

  logger.info('⚙️ Configuration loaded. Safety limits applied.');
  if (keywords.length > 0) {
    logger.info(`🎯 Targeting keywords: ${keywords.join(', ')}`);
  } else {
    logger.info('🏠 No keywords provided. Will target home feed.');
  }

  let context;
  try {
    const isHeadless = process.env.HEADLESS === 'true';
    logger.info(`Launching browser (Headless: ${isHeadless})...`);
    
    const authResult = await getAuthenticatedContext(
      isHeadless, 
      process.env.PINTEREST_EMAIL, 
      process.env.PINTEREST_PASSWORD
    );
    
    context = authResult.context;
    const page = authResult.page;

    logger.info('✅ Browser ready with advanced stealth evasion. Beginning engagement loop...');
    await runEngagementLoop(page, config, keywords);

  } catch (error) {
    logger.error('❌ An error occurred during bot execution:', error.message);
  } finally {
    if (context) {
      logger.info('🔒 Closing browser and saving persistent profile...');
      await context.close();
    }
    logger.info('🏁 Bot session finished.');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

main();
