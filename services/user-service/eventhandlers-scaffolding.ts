import fs from 'fs';
import path from 'path';

function writeCodeToFile(filePath: string, code: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✅ Wrote: ${filePath}`);
}

function scaffoldFunctionTests() {
  const fnDir = path.resolve('src/functions');
  const testDir = path.resolve('test/eventHandlers');
  if (!fs.existsSync(fnDir)) {
    console.warn('⚠️ No functions directory found at src/functions');
    return;
  }

  const files = fs.readdirSync(fnDir).filter(f => f.endsWith('.ts'));

  files.forEach(file => {
    const fnName = path.basename(file, '.ts');
    const testPath = path.join(testDir, `${fnName}.test.ts`);

    if (fs.existsSync(testPath)) {
      console.log(`ℹ️ Test file already exists for ${fnName}`);
      return;
    }

    const testCode = `import { expect } from 'chai';
import { GSStatus } from '@godspeedsystems/core';
import { makeContext } from '../helpers/makeContext';
import getGSApp from '../hooks/globalSetup';

describe('registerUserToDB', () => {
  let gsApp: any;
  let args: Record<string, unknown>;

  before(() => {
    gsApp = getGSApp();
  });

  beforeEach(() => {
    args = {};
  });

it('test description', async () => {
    const data = { params, body, headers, query, user }; // only need to fill the required fields. for example, if the function does not use params, you can leave it empty.
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['functionName']; /// get the function name from the src/functions directory. for example if the file name in the workflows directory is registerUserToDB.ts, the workflow name will be registerUserToDB
    const result: GSStatus = await workflow(ctx, args);

    // write expect statements here
  });

  // add more tests
});`;

    writeCodeToFile(testPath, testCode);
  });

  console.log('✅ Function test scaffolding complete.');
}

scaffoldFunctionTests();