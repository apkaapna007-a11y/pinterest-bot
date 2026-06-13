const logger = require('./logger');

// Helper: Random delay between min and max
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate a random Bezier curve for human-like mouse movement
function generateBezierCurve(startX, startY, endX, endY) {
  const points = [];
  const steps = getRandomDelay(10, 20);
  const cp1x = startX + (endX - startX) * Math.random();
  const cp1y = startY + (endY - startY) * Math.random() * 0.5;
  const cp2x = startX + (endX - startX) * (0.5 + Math.random() * 0.5);
  const cp2y = endY + (startY - endY) * Math.random() * 0.5;

  for (let t = 0; t <= 1; t += 1 / steps) {
    const x = Math.pow(1 - t, 3) * startX + 
              3 * Math.pow(1 - t, 2) * t * cp1x + 
              3 * (1 - t) * Math.pow(t, 2) * cp2x + 
              Math.pow(t, 3) * endX;
    const y = Math.pow(1 - t, 3) * startY + 
              3 * Math.pow(1 - t, 2) * t * cp1y + 
              3 * (1 - t) * Math.pow(t, 2) * cp2y + 
              Math.pow(t, 3) * endY;
    points.push({ x, y });
  }
  return points;
}

// Helper: Human-like mouse movement to a target element
async function moveMouseHumanLike(page, element) {
  const box = await element.boundingBox();
  if (!box) return false;

  const viewport = page.viewportSize();
  const startX = viewport.width / 2 + getRandomDelay(-100, 100);
  const startY = viewport.height / 2 + getRandomDelay(-100, 100);
  
  const endX = box.x + box.width * (0.2 + Math.random() * 0.6);
  const endY = box.y + box.height * (0.2 + Math.random() * 0.6);

  await page.mouse.move(startX, startY);
  await page.waitForTimeout(getRandomDelay(100, 300));

  const curve = generateBezierCurve(startX, startY, endX, endY);
  for (const point of curve) {
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(getRandomDelay(5, 15)); // Micro-delays between movements
  }
  
  return true;
}

// Helper: Human-like scrolling
async function humanScroll(page, distance = 500) {
  const steps = getRandomDelay(4, 8);
  const stepDistance = distance / steps;
  
  for (let i = 0; i < steps; i++) {
    // Add slight horizontal wobble to scrolling
    const wobble = getRandomDelay(-15, 15);
    await page.mouse.wheel(wobble, stepDistance);
    await page.waitForTimeout(getRandomDelay(150, 400));
  }
}

// Action: Like a pin
async function likePin(page, maxLikes, currentLikes) {
  if (currentLikes >= maxLikes) return currentLikes;

  try {
    const likeButton = await page.$('div[data-test-id="pin-reaction-heart"]');
    if (likeButton) {
      const isLiked = await likeButton.evaluate(el => el.getAttribute('aria-pressed') === 'true');
      if (!isLiked) {
        await moveMouseHumanLike(page, likeButton);
        await page.waitForTimeout(getRandomDelay(200, 500)); // Pause before clicking
        await likeButton.click();
        logger.info(`❤️ Liked a pin. (${currentLikes + 1}/${maxLikes})`);
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
  if (currentSaves >= maxSaves) return currentSaves;

  try {
    const saveButton = await page.$('div[data-test-id="pin-reaction-save"]');
    if (saveButton) {
      const isSaved = await saveButton.evaluate(el => el.getAttribute('aria-pressed') === 'true');
      if (!isSaved) {
        await moveMouseHumanLike(page, saveButton);
        await page.waitForTimeout(getRandomDelay(200, 500));
        await saveButton.click();
        logger.info(`📌 Saved a pin. (${currentSaves + 1}/${maxSaves})`);
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
  if (currentFollows >= maxFollows) return currentFollows;

  try {
    const followButton = await page.$('button[data-test-id="follow-button"]');
    if (followButton) {
      const isFollowing = await followButton.evaluate(el => el.innerText.toLowerCase().includes('following'));
      if (!isFollowing) {
        await moveMouseHumanLike(page, followButton);
        await page.waitForTimeout(getRandomDelay(300, 600));
        await followButton.click();
        logger.info(`👤 Followed a user. (${currentFollows + 1}/${maxFollows})`);
        return currentFollows + 1;
      }
    }
  } catch (e) {
    // Button might not be visible or already following
  }
  return currentFollows;
}

// Main loop: Browse home feed or search and perform actions
async function runEngagementLoop(page, config, keywords) {
  let totalLikes = 0;
  let totalSaves = 0;
  let totalFollows = 0;

  logger.info('🚀 Starting targeted engagement loop...');

  // If no keywords provided, fallback to home feed
  const targets = keywords && keywords.length > 0 ? keywords : [''];

  for (const keyword of targets) {
    if (totalLikes >= config.maxLikes && totalSaves >= config.maxSaves && totalFollows >= config.maxFollows) {
      logger.info('🛑 All session limits reached. Stopping.');
      break;
    }

    if (keyword) {
      logger.info(`🔍 Navigating to search results for: "${keyword}"`);
      const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keyword)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    } else {
      logger.info('🏠 Navigating to home feed...');
      await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
    }
    
    await page.waitForTimeout(getRandomDelay(3000, 5000));

    const maxIterations = 15; // Per keyword/target
    
    for (let i = 0; i < maxIterations; i++) {
      if (totalLikes >= config.maxLikes && totalSaves >= config.maxSaves && totalFollows >= config.maxFollows) {
        logger.info('🛑 All session limits reached. Stopping.');
        break;
      }

      logger.info(`Iteration ${i + 1}/${maxIterations} for "${keyword || 'Home'}". Scrolling and engaging...`);
      
      // Scroll down to load new content
      await humanScroll(page, getRandomDelay(600, 1000));
      await page.waitForTimeout(getRandomDelay(config.minDelayBetweenActions, config.maxDelayBetweenActions));

      // Attempt actions on visible pins
      if (config.actionLike) totalLikes = await likePin(page, config.maxLikes, totalLikes);
      if (config.actionSave) totalSaves = await savePin(page, config.maxSaves, totalSaves);
      
      // Occasionally check for follow opportunities
      if (config.actionFollow && Math.random() > 0.7) {
        totalFollows = await followUser(page, config.maxFollows, totalFollows);
      }

      // Random longer pause to simulate reading/thinking
      if (Math.random() > 0.6) {
        const longPause = getRandomDelay(config.minDelayBetweenPages, config.maxDelayBetweenPages);
        logger.info(`☕ Taking a human-like pause for ${(longPause / 1000).toFixed(1)} seconds...`);
        await page.waitForTimeout(longPause);
      }
    }

    // Pause between keywords to simulate natural browsing behavior
    if (keyword && targets.indexOf(keyword) < targets.length - 1) {
      const keywordPause = getRandomDelay(10000, 20000);
      logger.info(`⏳ Finished keyword "${keyword}". Pausing for ${(keywordPause / 1000).toFixed(1)}s before next keyword...`);
      await page.waitForTimeout(keywordPause);
    }
  }

  logger.info(`✅ Session complete. Total: ${totalLikes} likes, ${totalSaves} saves, ${totalFollows} follows.`);
}

module.exports = { runEngagementLoop, getRandomDelay };
