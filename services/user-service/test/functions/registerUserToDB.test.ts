import { expect } from 'chai';
import { GSStatus } from '@godspeedsystems/core';
import sinon from 'sinon';
import gsApp from '../../src/index';

describe('registerUserToDB', () => {
  let args: any;
  let findUniqueStub: sinon.SinonStub;
  let createStub: sinon.SinonStub;

  beforeEach(() => {
    args = {};
    findUniqueStub = sinon.stub();
    createStub = sinon.stub();

    // Mock the datasources directly on gsApp
    (gsApp as any).datasources = {
      schema: {
        client: {
          user: {
            findUnique: findUniqueStub,
            create: createStub,
          },
        },
      },
    };
  });

  it('should return an error if email is missing', async () => {
    const result = await gsApp.executeWorkflow("registerUserToDB.ts", args);
    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data.missing).to.deep.equal(['email', 'passwordHash', 'role']);
  });

  it('should return an error if passwordHash is missing', async () => {
    (gsApp as any).inputs = { data: { body: { email: 'test@example.com' } } };
    const result = await gsApp.executeWorkflow("registerUserToDB.ts", args);
    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data.missing).to.deep.equal(['passwordHash', 'role']);
  });

  it('should return an error if role is missing or empty', async () => {
    (gsApp as any).inputs = { data: { body: { email: 'test@example.com', passwordHash: 'password' } } };
    const result = await gsApp.executeWorkflow("registerUserToDB", args);
    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(400);
    expect(result.message).to.equal('Missing or invalid required fields');
    expect(result.data.missing).to.deep.equal(['role']);
  });

  it('should return an error if user already exists', async () => {
    (gsApp as any).inputs = { data: { body: { email: 'test@example.com', passwordHash: 'password', role: ['user'] } } };
    findUniqueStub.resolves({ email: 'test@example.com' });
    const result = await gsApp.executeWorkflow("registerUserToDB", args);
    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.false;
    expect(result.code).to.equal(409);
    expect(result.message).to.equal('User already exists');
    expect(result.data.email).to.equal('test@example.com');
  });

  it('should create a user successfully', async () => {
    (gsApp as any).inputs = { data: { body: { email: 'test@example.com', passwordHash: 'password', role: ['user'] } } };
    findUniqueStub.resolves(null);
    createStub.resolves({ id: '123', email: 'test@example.com', role: ['user'], status: 'active' });
    const result = await gsApp.executeWorkflow("registerUserToDB", args);
    expect(result).to.be.an.instanceOf(GSStatus);
    expect(result.success).to.be.true;
    expect(result.code).to.equal(201);
    expect(result.message).to.equal('User created successfully');
    expect(result.data.userId).to.equal('123');
    expect(result.data.email).to.equal('test@example.com');
    expect(result.data.role).to.deep.equal(['user']);
  });
});