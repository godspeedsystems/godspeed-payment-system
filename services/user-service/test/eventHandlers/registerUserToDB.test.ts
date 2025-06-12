import { expect } from 'chai';
import { GSStatus } from '@godspeedsystems/core';
import { makeContext } from '../helpers/makeContext';
import getGSApp from '../hooks/globalSetup';
import sinon from 'sinon';

describe('registerUserToDB', () => {
  let gsApp: any;
  let args: Record<string, unknown>;
  let prismaClient: any;

  before(() => {
    gsApp = getGSApp();
  });

  beforeEach(() => {
    args = {};
    prismaClient = gsApp.datasources.schema.client;
  });

  it('Should register a new user successfully with valid input', async () => {
    const userData = {
      email: 'unique_test_email_' + Date.now() + '@example.com',
      passwordHash: 'hashedPassword',
      role: ['user'],
    };

    const data = { body: userData };
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['registerUserToDB'];

    // Stub the prismaClient.user.create method to return a mock user
    const mockUser = {
      id: 'mockUserId',
      email: userData.email,
      role: userData.role,
      status: 'active',
    };
    sinon.replace(prismaClient.user, 'create', sinon.fake.resolves(mockUser));

    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.true;
    expect(result.code).to.equal(201);
    expect(result.message).to.equal('User created successfully');
    expect(result.data).to.deep.equal({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      status: mockUser.status,
    });
    sinon.restore();
  });

  it('Should return an error if the email is already registered', async () => {
    const userData = {
      email: 'existing@example.com',
      passwordHash: 'hashedPassword',
      role: ['user'],
    };

    const data = { body: userData };
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['registerUserToDB'];

    // Stub the prismaClient.user.findUnique method to return an existing user
    prismaClient.user.findUnique = sinon.stub().resolves({ email: userData.email });

    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(409);
    expect(result.message).to.equal('User already exists');
    expect(result.data).to.deep.equal({ email: userData.email });
  });

  it('Should return an error if missing required fields', async () => {
    const userData = {}; // Missing all required fields

    const data = { body: userData };
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['registerUserToDB'];

    const result: GSStatus = await workflow(ctx, args);

    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data).to.deep.equal({
      missing: ['email', 'passwordHash', 'role'],
    });
  });

  it('Should handle database connection errors gracefully', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      role: ['user'],
    };

    const data = { body: userData };
    const ctx = makeContext(gsApp, data);
    const workflow = gsApp.workflows['registerUserToDB'];

    // Stub the prismaClient.user.create method to reject with an error
    prismaClient.user.create = sinon.stub().rejects(new Error('Database connection error'));
    prismaClient.user.findUnique = sinon.stub().resolves(null);

    const result: GSStatus = await workflow(ctx, args);

    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(500);
    expect(result.message).to.equal('Database connection error');
  });
});
