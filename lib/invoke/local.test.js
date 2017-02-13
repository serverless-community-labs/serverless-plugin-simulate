'use strict'

const BbPromise = require('bluebird')

const run = jest.fn()

jest.mock('./run', () => run)

const lambdaLocal = require('./local')

describe('local-invoke', () => {
  beforeEach(() => {
    run.mockClear()
  })

  it('should invoke run', () => {
    const funcConfig = {
      runtime: 'node4.3',
      servicePath: '/test/path',
      handler: 'index.handler',
      memorySize: 512,
      timeout: 10,
      region: 'us-east-1',
      environment: {},
      stage: 'test',
      key: 'test-service-test-test-func',
    }
    const event = {}

    const result = {
      stdout: '{ "message": "saved" }',
    }

    run.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal()

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(run.mock.calls.length).toBe(1)
      expect(run.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_NAME=test-service-test-test-func',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_LAMBDA_LOG_GROUP_NAME=/aws/lambda/test-service-test-test-func',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
          '-e', 'SERVERLESS_SIMULATE_STAGE=test',
        ],
      })

      expect(actual).toEqual({
        message: 'saved',
      })
    })
  })

  it('should fail when errorMessage returned', () => {
    const funcConfig = {
      runtime: 'python2.7',
      servicePath: '/test/path',
      handler: 'index.handler',
      memorySize: 512,
      timeout: 10,
      region: 'us-east-1',
      environment: {},
      stage: 'test',
      key: 'test-service-test-test-func',
    }
    const event = {}

    const result = {
      stdout: '{ "errorMessage": "My Test Error" }',
    }

    run.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(run.mock.calls.length).toBe(1)
      expect(run.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:python2.7',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_NAME=test-service-test-test-func',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_LAMBDA_LOG_GROUP_NAME=/aws/lambda/test-service-test-test-func',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
          '-e', 'SERVERLESS_SIMULATE_STAGE=test',
          '-e', 'SERVERLESS_SIMULATE_LAMBDA_ENDPOINT=http://localhost:5001',
        ],
      })

      expect(err.message).toEqual('My Test Error')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })

  it('should fail when stderr returned with no stdout', () => {
    const funcConfig = {
      runtime: 'node4.3',
      servicePath: '/test/path',
      handler: 'index.handler',
      memorySize: 512,
      timeout: 10,
      region: 'us-east-1',
      environment: {},
      stage: 'test',
      key: 'test-service-test-test-func',
    }
    const event = {}

    const result = {
      stderr: 'Something went wrong',
    }

    run.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(run.mock.calls.length).toBe(1)
      expect(run.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_NAME=test-service-test-test-func',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_LAMBDA_LOG_GROUP_NAME=/aws/lambda/test-service-test-test-func',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
          '-e', 'SERVERLESS_SIMULATE_STAGE=test',
          '-e', 'SERVERLESS_SIMULATE_LAMBDA_ENDPOINT=http://localhost:5001',
        ],
      })

      expect(err.message).toEqual('Error executing function')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })

  it('should fail when stdout has invalid json', () => {
    const funcConfig = {
      runtime: 'node4.3',
      servicePath: '/test/path',
      handler: 'index.handler',
      memorySize: 512,
      timeout: 10,
      region: 'us-east-1',
      environment: {},
      stage: 'test',
      key: 'test-service-test-test-func',
    }
    const event = {}

    const result = {
      stdout: '{ " } went wrong not json',
    }

    run.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(run.mock.calls.length).toBe(1)
      expect(run.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_NAME=test-service-test-test-func',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_LAMBDA_LOG_GROUP_NAME=/aws/lambda/test-service-test-test-func',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
          '-e', 'SERVERLESS_SIMULATE_STAGE=test',
          '-e', 'SERVERLESS_SIMULATE_LAMBDA_ENDPOINT=http://localhost:5001',
        ],
      })

      expect(err.message).toEqual('Error executing function')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })
})
