import { expect } from 'chai';
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

  it('should successfully register a new user', async () => {
    const timestamp = Date.now();
    const data = {
      body: {
        email: `test${timestamp}@example.com`,
        passwordHash: 'hashed_password',
        role: ['MERCHANT'],
      },
    };
    const ctx = makeContext(gsApp, data);
    ctx.datasources.schema.client.user.findUnique = async () => null;
    // Mock the prismaClient.user.findUnique method
    ctx.datasources.schema.client.user.findUnique = async () => null;
    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.true;
    expect(result.code).to.equal(201);
    expect(result.message).to.equal('User created successfully');
    expect(result.data).to.have.property('userId');
    expect(result.data).to.have.property('email', `test${timestamp}@example.com`);
    expect(result.data).to.have.property('role');
  });

  it('should return an error if required fields are missing', async () => {
    const data = {
      body: {},
    };
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data).to.have.property('missing');
  });

  it('should return an error if user already exists', async () => {
    // Mock the prismaClient to return an existing user
    const data = {
      body: {
        email: 'existing@example.com',
        passwordHash: 'hashed_password',
        role: ['MERCHANT'],
      },
    };
    const ctx = makeContext(gsApp, data);
    // Mock the prismaClient.user.findUnique method
    ctx.datasources.schema.client.user.findUnique = async () => ({
      id: '123',
      email: 'existing@example.com',
      passwordHash: 'hashed_password',
      role: ['MERCHANT'],
    });
    const workflow = gsApp.workflows['registerUserToDB'];
    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(409);
    expect(result.message).to.equal('User already exists');
    expect(result.data).to.have.property('email', 'existing@example.com');
  });
});