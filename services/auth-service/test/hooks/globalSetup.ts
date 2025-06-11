import appPromise from '../../src/index';
import { logger } from '@godspeedsystems/core';

let gsApp: any;

before(async function () {
  this.timeout(10000);
  try {
    gsApp = await appPromise;
  } catch (err) {
    logger.error('App failed to start:', err);
    throw err;
  }
});

export default () => gsApp;