const fs = require('fs');
const path = require('path');

/**
 * Writes the given code to the specified file path.
 * Creates directories and the file if they don't exist.
 * @param {string} filePath - The full path to the file (e.g., './src/utils/helper.js')
 * @param {string} code - The code content to write
 */
function writeCodeToFile(filePath, code) {
  const dir = path.dirname(filePath);

  // Create directories recursively if they don't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write code to file (overwrite if already exists)
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Wrote to ${filePath}`);
}

function addScriptsToPackageJson(projectRoot, newScripts) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.scripts = {
    ...(packageJson.scripts || {}),
    ...newScripts,
  };

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n', // formatted nicely
    'utf8'
  );

  console.log(`Updated scripts in ${packageJsonPath}`);
}

writeCodeToFile('./test/hooks/globalSetup.ts', `import appPromise from '../../src/index';
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

export default () => gsApp;`);

writeCodeToFile('./test/helpers/makeContext.ts', `import { GSContext, logger } from '@godspeedsystems/core';
import { makeEvent } from './makeEvent';

export function makeContext(app: any, data: Record<string, any>) {
  const event = makeEvent(data);
  const childLogger = logger.child(app.getCommonAttrs(event));

  return new GSContext(
    app.config,
    app.datasources,
    event,
    app.mappings,
    app.nativeFunctions,
    app.plugins,
    logger,
    childLogger
  );
}`);

writeCodeToFile('./test/helpers/makeEvent.ts', `import { GSCloudEvent, GSActor } from '@godspeedsystems/core';

export function makeEvent(data: Record<string, any>) {
  return new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
}`);

writeCodeToFile('./tsconfig.test.json', `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "test/dist",
    "rootDir": ".",
    "noEmit": false,
    "types": ["mocha", "node"],
    "typeRoots": ["./node_modules/@types"]
  },
  "include": ["test/**/*", "src/**/*"]
}`);

writeCodeToFile('./mocha.config.js', `module.exports = {
  require: ['test/dist/hooks/globalSetup.js'],
};`);

addScriptsToPackageJson('', {
  "build:test": "rm -rf dist && godspeed build && rm -rf test/dist && npm install --save-dev @types/mocha && tsc -p tsconfig.test.json",
	"test": "npm run build:test && mocha test/dist/**/*.test.js"
})

writeCodeToFile('./src/index.ts', `try {
    if (process.env.OTEL_ENABLED == 'true') {
        require('@godspeedsystems/tracing').initialize();
    }
} catch (error) {
    console.error("OTEL_ENABLED is set, unable to initialize opentelemetry tracing.");
    console.error(error);
    process.exit(1);
}

import Godspeed from "@godspeedsystems/core";

// // create a godspeed
// const gsApp = new Godspeed();

// // initilize the Godspeed App
// // this is responsible to load all kind of entities
// gsApp.initialize();

async function bootstrap() {
  const gsApp = new Godspeed();
  await gsApp.initialize();
  return gsApp;
}

// ✅ Export a Promise (resolves to initialized app)
const appPromise = bootstrap();
export default appPromise;`);