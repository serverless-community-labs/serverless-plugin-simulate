'use strict'

const BbPromise = require('bluebird')

const mockRun = jest.fn()

jest.mock('./run', () => mockRun)

const lambdaLocal = require('./local')

describe('local-invoke', () => {
  beforeEach(() => {
    mockRun.mockClear()
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

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal()

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

  it('should invoke run with network', () => {
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
      projectName: 'testproject',
    }
    const event = {}

    const result = {
      stdout: '{ "message": "saved" }',
    }

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal()

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'testproject_default',
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

  it('should invoke when errorMessage returned', () => {
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

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:python2.7',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

      expect(actual.errorMessage).toEqual('My Test Error')
    })
  })

  it('should not fail when stderr returned with no stdout', () => {
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

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

      expect(actual).toEqual(null)
    })
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

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

  it('should pass when no error or result have been returned', () => {
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

    const result = {}

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

      expect(actual).toEqual(null)
    })
  })

  it('should pass when error is null and no result passed', () => {
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
      errorMessage: null,
    }

    mockRun.mockImplementation(() => BbPromise.resolve(result))

    const lambda = lambdaLocal('http://localhost:5001')

    return lambda
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(mockRun.mock.calls.length).toBe(1)
      expect(mockRun.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '--network', 'host',
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

      expect(actual).toEqual(null)
    })
  })
})
