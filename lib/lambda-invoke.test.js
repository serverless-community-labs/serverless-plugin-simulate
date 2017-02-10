'use strict'

const dockerLambda = jest.fn()

jest.mock('docker-lambda', () => dockerLambda)

const lambdaInvoke = require('./lambda-invoke')

describe('lambda-invoke', () => {
  beforeEach(() => {
    dockerLambda.mockClear()
  })

  it('should invoke dockerLambda', () => {
    const path = '/test/path'
    const handler = 'index.handler'
    const memoryLimit = 512
    const event = {}
    const environment = {}

    const result = {
      stdout: '{ "message": "saved" }',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke.invoke(path, handler, memoryLimit, event, environment).then((actual) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler,
        event,
        taskDir: path,
        cleanUp: true,
        returnSpawnResult: true,
        dockerArgs: [
          '-m', '512M',
          '-e', 'SERVERLESS_SIMULATE=true',
        ],
      })

      expect(actual).toEqual({
        message: 'saved',
      })
    })
  })

  it('should fail when errorMessage returned', () => {
    const path = '/test/path'
    const handler = 'index.handler'
    const memoryLimit = 512
    const event = {}
    const environment = {}

    const result = {
      stdout: '{ "errorMessage": "My Test Error" }',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke.invoke(path, handler, memoryLimit, event, environment).catch((err) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler,
        event,
        taskDir: path,
        cleanUp: true,
        returnSpawnResult: true,
        dockerArgs: [
          '-m', '512M',
          '-e', 'SERVERLESS_SIMULATE=true',
        ],
      })

      expect(err.message).toEqual('My Test Error')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })

  it('should fail when stderr returned with no stdout', () => {
    const path = '/test/path'
    const handler = 'index.handler'
    const memoryLimit = 512
    const event = {}
    const environment = {}

    const result = {
      stderr: 'Something went wrong',
    }

    dockerLambda.mockImplementation(() => result)

    return lambdaInvoke.invoke(path, handler, memoryLimit, event, environment).catch((err) => {
      expect(dockerLambda.mock.calls.length).toBe(1)
      expect(dockerLambda.mock.calls[0][0]).toEqual({
        addEnvVars: true,
        handler,
        event,
        taskDir: path,
        cleanUp: true,
        returnSpawnResult: true,
        dockerArgs: [
          '-m', '512M',
          '-e', 'SERVERLESS_SIMULATE=true',
        ],
      })

      expect(err.message).toEqual('Something went wrong')

      return true
    })
    .then(handled => expect(handled).toEqual(true))
  })
})
