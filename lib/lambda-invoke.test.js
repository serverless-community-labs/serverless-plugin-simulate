'use strict'

const dockerLambda = jest.fn()

jest.mock('docker-lambda', () => dockerLambda)

const lambdaInvoke = require('./lambda-invoke')

describe('lambda-invoke', () => {
  beforeEach(() => {
    dockerLambda.mockClear()
  })

  it('should invoke dockerLambda', () => {
    const funcConfig = {
      runtime: 'node4.3',
      servicePath: '/test/path',
      handler: 'index.handler',
      memorySize: 512,
      timeout: 10,
      region: 'us-east-1',
      environment: {},
    }
    const event = {}

    const result = {
      stdout: '{ "message": "saved" }',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke
    .invoke(funcConfig, event)
    .then((actual) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
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
    }
    const event = {}

    const result = {
      stdout: '{ "errorMessage": "My Test Error" }',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:python2.7',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
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
    }
    const event = {}

    const result = {
      stderr: 'Something went wrong',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
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
    }
    const event = {}

    const result = {
      stdout: '{ " } went wrong not json',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke
    .invoke(funcConfig, event)
    .catch((err) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler: funcConfig.handler,
        event,
        taskDir: funcConfig.servicePath,
        cleanUp: true,
        returnSpawnResult: true,
        dockerImage: 'lambci/lambda:node4.3',
        dockerArgs: [
          '-m', '512M',
          '-e', 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512',
          '-e', 'AWS_LAMBDA_FUNCTION_TIMEOUT=10',
          '-e', 'AWS_REGION=us-east-1',
          '-e', 'SERVERLESS_SIMULATE=true',
        ],
      })

      expect(err.message).toEqual('Error executing function')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })
})
