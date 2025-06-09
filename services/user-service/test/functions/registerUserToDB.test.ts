import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import {
  GSStatus,
  GSContext,
  GSCloudEvent,
  logger,
  GSActor
} from '@godspeedsystems/core';

import appPromise from '../../src/index'

let gsApp: any;

before(function () {
  this.timeout(10000);
  return appPromise.then(app => {
    gsApp = app;
  }).catch(err => {
    console.error('App failed to start:', err);
    throw err;
  });
});

// before(async () => {
//   // gsApp = (await appPromise.default) || (await appPromise);
//   this.timeout(10000); // 10 seconds
//   gsApp = await appPromise;
// });

describe('registerUserToDB', () => {
  let args: Record<string, unknown>;
  let findUniqueStub: SinonStub;
  let createStub: SinonStub;

  beforeEach(() => {
    args = {};
    findUniqueStub = sinon.stub();
    createStub = sinon.stub();

    gsApp.datasources = {
      schema: {
        client: {
          user: {
            findUnique: findUniqueStub,
            create: createStub
          }
        }
      }
    };
  });

  it('should return an error if email is missing', async () => {
    const data = { body: {} };
    const event = new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
    const childLogger = logger.child(gsApp.getCommonAttrs(event));
    const ctx = new GSContext(
      gsApp.config,
      gsApp.datasources,
      event,
      gsApp.mappings,
      gsApp.nativeFunctions,
      gsApp.plugins,
      logger,
      childLogger
    );

    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result).to.be.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data.missing).to.deep.equal(['email', 'passwordHash', 'role']);
  });

  it('should return an error if passwordHash is missing', async () => {
    const data = { body: { email: 'test@example.com' } };
    const event = new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
    const childLogger = logger.child(gsApp.getCommonAttrs(event));
    const ctx = new GSContext(
      gsApp.config,
      gsApp.datasources,
      event,
      gsApp.mappings,
      gsApp.nativeFunctions,
      gsApp.plugins,
      logger,
      childLogger
    );

    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.data.missing).to.deep.equal(['passwordHash', 'role']);
  });

  it('should return an error if role is missing or empty', async () => {
    const data = {
      body: {
        email: 'test@example.com',
        passwordHash: 'password'
      }
    };
    const event = new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
    const childLogger = logger.child(gsApp.getCommonAttrs(event));
    const ctx = new GSContext(
      gsApp.config,
      gsApp.datasources,
      event,
      gsApp.mappings,
      gsApp.nativeFunctions,
      gsApp.plugins,
      logger,
      childLogger
    );

    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.data.missing).to.deep.equal(['role']);
  });

  it('should return an error if user already exists', async () => {
    const data = {
      body: {
        email: 'test@example.com',
        passwordHash: 'password',
        role: ['user']
      }
    };
    const event = new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
    const childLogger = logger.child(gsApp.getCommonAttrs(event));
    const ctx = new GSContext(
      gsApp.config,
      gsApp.datasources,
      event,
      gsApp.mappings,
      gsApp.nativeFunctions,
      gsApp.plugins,
      logger,
      childLogger
    );

    findUniqueStub.resolves({ email: 'test@example.com' });

    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(409);
    expect(result.message).to.equal('User already exists');
    expect(result.data.email).to.equal('test@example.com');
  });

  it('should create a user successfully', async () => {
    const data = {
      body: {
        email: 'test@example.com',
        passwordHash: 'password',
        role: ['user']
      }
    };
    const event = new GSCloudEvent('', '', new Date(), '', '', data, 'REST', new GSActor('user'), {});
    const childLogger = logger.child(gsApp.getCommonAttrs(event));
    const ctx = new GSContext(
      gsApp.config,
      gsApp.datasources,
      event,
      gsApp.mappings,
      gsApp.nativeFunctions,
      gsApp.plugins,
      logger,
      childLogger
    );

    findUniqueStub.resolves(null);
    createStub.resolves({
      id: '123',
      email: 'test@example.com',
      role: ['user'],
      status: 'active'
    });

    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.true;
    expect(result.code).to.equal(201);
    expect(result.message).to.equal('User created successfully');
    expect(result.data.userId).to.equal('123');
    expect(result.data.email).to.equal('test@example.com');
    expect(result.data.role).to.deep.equal(['user']);
  });
});