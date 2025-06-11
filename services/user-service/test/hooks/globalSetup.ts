import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import appPromise from '../../src/index';
import { logger } from '@godspeedsystems/core';

const envPath = path.resolve(__dirname, '../../.env');
const testEnvPath = path.resolve(__dirname, '../../.test.env');

if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
if (fs.existsSync(testEnvPath)) dotenv.config({ path: testEnvPath, override: true });

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