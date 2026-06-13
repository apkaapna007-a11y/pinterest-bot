const logger = require('./logger');

// Helper: Random delay between min and max
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Human-like scrolling
async function humanScroll(page, distance = 500) {
  const steps = 5;
  const stepDistance = distance / steps;
  
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDistance);
    await page.waitForTimeout(getRandomDelay(200, 600));
  }
}

// Action: Like a pin
async function likePin(page, maxLikes, currentLikes) {
  if (currentLikes >= maxLikes) {
    logger.info('Max likes for this session reached.');
    return currentLikes;
  }

  try {
    // Look for the like button (heart icon)
    const likeButton = await page.$('div[data-test-id="pin-reaction-heart"]');
    if (likeButton) {
      const isLiked = await likeButton.evaluate(el => el.getAttribute('aria-pressed') === 'true');
      if (!isLiked) {
        await likeButton.click();
        logger.info(`Liked a pin. (${currentLikes + 1}/${maxLikes})`);
        return currentLikes + 1;
      }
    }
  } catch (e) {
    // Button might not be visible or already liked
  }
  return currentLikes;
}

// Action: Save (Repin) a pin
async function savePin(page, maxSaves, currentSaves) {
  if (currentSaves >= maxSaves) {
    logger.info('Max saves for this session reached.');
    return currentSaves;
  }

  try {
    const saveButton = await page.$('div[data-test-id="pin-reaction-save"]');
    if (saveButton) {
      const isSaved = await saveButton.evaluate(el => el.getAttribute('aria-pressed') === 'true');
      if (!isSaved) {
        await saveButton.click();
        logger.info(`Saved a pin. (${currentSaves + 1}/${maxSaves})`);
        return currentSaves + 1;
      }
    }
  } catch (e) {
    // Button might not be visible or already saved
  }
  return currentSaves;
}

// Action: Follow a user
async function followUser(page, maxFollows, currentFollows) {
  if (currentFollows >= maxFollows) {
    logger.info('Max follows for this session reached.');
    return currentFollows;
  }

  try {
    // Look for follow button on profile or pin creator
    const followButton = await page.$('button[data-test-id="follow-button"]');
    if (followButton) {
      const isFollowing = await followButton.evaluate(el => el.innerText.toLowerCase().includes('following'));
      if (!isFollowing) {
        await followButton.click();
        logger.info(`Followed a user. (${currentFollows + 1}/${maxFollows})`);
        return currentFollows + 1;
      }
    }
  } catch (e) {
    // Button might not be visible or already following
  }
  return currentFollows;
}

// Main loop: Browse home feed or search and perform actions
async function runEngagementLoop(page, config) {
  let likes = 0;
  let saves = 0;
  let follows = 0;

  logger.info('Starting engagement loop...');
  
  // Navigate to home feed
  await page.goto('https://www.pinterest.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const maxIterations = 20; // Prevent infinite loops
  
  for (let i = 0; i < maxIterations; i++) {
    if (likes >= config.maxLikes && saves >= config.maxSaves && follows >= config.maxFollows) {
      logger.info('All session limits reached. Stopping.');
      break;
    }

    logger.info(`Iteration ${i + 1}/${maxIterations}. Scrolling and engaging...`);
    
    // Scroll down to load new content
    await humanScroll(page, 800);
    await page.waitForTimeout(getRandomDelay(config.minDelayBetweenActions, config.maxDelayBetweenActions));

    // Attempt actions on visible pins
    if (config.actionLike) likes = await likePin(page, config.maxLikes, likes);
    if (config.actionSave) saves = await savePin(page, config.maxSaves, saves);
    
    // Occasionally check for follow opportunities (e.g., if we land on a profile)
    if (config.actionFollow && Math.random() > 0.7) {
      follows = await followUser(page, config.maxFollows, follows);
    }

    // Random longer pause to simulate reading/thinking
    if (Math.random() > 0.5) {
      const longPause = getRandomDelay(config.minDelayBetweenPages, config.maxDelayBetweenPages);
      logger.info(`Taking a human-like pause for ${longPause / 1000} seconds...`);
      await page.waitForTimeout(longPause);
    }
  }

  logger.info(`Session complete. Total: ${likes} likes, ${saves} saves, ${follows} follows.`);
}

module.exports = { runEngagementLoop, getRandomDelay };
