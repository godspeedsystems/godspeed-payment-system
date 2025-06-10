import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { GSStatus } from '@godspeedsystems/core';

import { makeContext } from '../helpers/makeContext';

import getGSApp from '../hooks/globalSetup';

describe('new', () => {
  let gsApp: any;
  let args: Record<string, unknown>;
  let findUniqueStub: SinonStub;
  let createStub: SinonStub;

  before(() => {
    gsApp = getGSApp();
  });

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
    const ctx = makeContext(gsApp, data);
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
    const ctx = makeContext(gsApp, data);
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
    const ctx = makeContext(gsApp, data);
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
    const ctx = makeContext(gsApp, data);
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
    const ctx = makeContext(gsApp, data);
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