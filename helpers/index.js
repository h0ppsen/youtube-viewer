/* eslint-disable no-restricted-syntax */
const _random = require('lodash/random');

const { logger } = require('../utils');

const watchVideosInSequence = async (page, ipAddr, targetUrlsList, durationInSeconds) => {
  for (const url of targetUrlsList) {
    await page.goto(url, { waitUntil: 'load' });
    try {

      await page.waitForXPath('//paper-button[contains(., "No thanks")]', { timeout: 5000 });
      let [button] = await page.$x('//paper-button[contains(., "No thanks")]');
      if (button) {
        await button.click();
      }

      await page.waitForXPath('//iframe[@id="iframe"]', { timeout: 5000 });
      const [elementHandle] = await page.$x('//iframe[@id="iframe"]');
      const iframe = await elementHandle.contentFrame();
      [button] = await iframe.$x('//div[@id="introAgreeButton"]');
      if (button) {
        await button.click();
      }

      const duration = (durationInSeconds + _random(1, (durationInSeconds / 6), true));
      await page.waitFor(duration * 1000);
      await logger.logCount(page, url, ipAddr, duration);
    } catch {
      logger.logFailedAttempt(url, ipAddr);
    }
  }
};

module.exports = { watchVideosInSequence };
