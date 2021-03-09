/* eslint-disable no-restricted-syntax */
const _random = require('lodash/random');

const { logger } = require('../utils');

const watchVideosInSequence = async (page, ipAddr, targetUrlsList, durationInSeconds) => {

  const _isPlaying = async (page) => {
    const title = await page.evaluate('document.querySelector("button.ytp-play-button.ytp-button").getAttribute("title");')
      .catch(() => undefined);
    if (!!title)
      return !title.toString().includes('Play');
    return false;
  };


  for (const url of targetUrlsList) {
    await page.goto(url, { waitUntil: 'load' });

    try {

      await page.waitForXPath('//paper-button[contains(., "No thanks")]', { timeout: 3000, visible: true })
        .catch(() => undefined);
      let [button] = await page.$x('//paper-button[contains(., "No thanks")]');
      if (button) {
        await button.click();
      }


      for (const f of page.frames()) {
        const frame = await f.waitForXPath('//div[@id="introAgreeButton"]', { timeout: 3000, visible: true })
          .catch(() => undefined);

        if (!frame) continue;

        const [button] = await frame.$x('//div[@id="introAgreeButton"]').catch(() => undefined);
        if (button) {
          await button.click();
        }
      }

      const [playButton] = await page.$x('//button[@class="ytp-play-button ytp-button"]', { timeout: 3000 })
        .catch(() => undefined);

      if (!playButton) {
        logger.error('Cannot find play button! Skipping for now...');
        continue;
      }

      //TODO: Ads handling

      for (let i = 0; i < 5; i++) {
        if (await _isPlaying(page)) {
          logger.info('Video is playing!');

          const duration = (durationInSeconds + _random(1, (durationInSeconds / 6), true));
          await page.waitFor(duration * 1000);
          await logger.logCount(page, url, ipAddr, duration);

          break;
        }
        logger.info('Video not playing. Pressing play...');
        playButton.click();
      }

    } catch (e) {
      logger.debug(e.message);
      logger.logFailedAttempt(url, ipAddr);
    }
  }
};

module.exports = { watchVideosInSequence };
