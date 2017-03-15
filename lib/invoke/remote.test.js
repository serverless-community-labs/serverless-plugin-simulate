'use strict'

const BbPromise = require('bluebird')

jest.mock('request-promise', () => jest.fn())

const rp = require('request-promise')

const remoteLambdaFactory = require('./remote')

describe('local-invoke', () => {
  beforeEach(() => {
    rp.mockClear()
  })

  it('should invoke remote function', () => {
    rp.mockImplementation(() => BbPromise.resolve({ result: true }))

    const lambdaEndpoint = 'http://localhost'
    const remoteLambda = remoteLambdaFactory(lambdaEndpoint)

    const func = {
      key: 'func-key',
    }
    const event = {}

    return remoteLambda.invoke(func, event).then((result) => {
      expect(rp.mock.calls.length).toBe(1)
      expect(rp.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: `${lambdaEndpoint}/2015-03-31/functions/${func.key}/invocations`,
        headers: {
          'X-Amz-Invocation-Type': 'RequestResponse',
        },
        body: event,
        json: true,
      })

      expect(result).toEqual({ result: true })
    })
  })

  it('should remove trailing slash', () => {
    rp.mockImplementation(() => BbPromise.resolve({ result: true }))

    const lambdaEndpoint = 'http://localhost/'
    const remoteLambda = remoteLambdaFactory(lambdaEndpoint)

    const func = {
      key: 'func-key',
    }
    const event = {}

    return remoteLambda.invoke(func, event).then((result) => {
      expect(rp.mock.calls.length).toBe(1)
      expect(rp.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: `${lambdaEndpoint}2015-03-31/functions/${func.key}/invocations`,
        headers: {
          'X-Amz-Invocation-Type': 'RequestResponse',
        },
        body: event,
        json: true,
      })

      expect(result).toEqual({ result: true })
    })
  })

  it('should have default event', () => {
    rp.mockImplementation(() => BbPromise.resolve({ result: true }))

    const lambdaEndpoint = 'http://localhost/'
    const remoteLambda = remoteLambdaFactory(lambdaEndpoint)

    const func = {
      key: 'func-key',
    }

    return remoteLambda.invoke(func).then((result) => {
      expect(rp.mock.calls.length).toBe(1)
      expect(rp.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: `${lambdaEndpoint}2015-03-31/functions/${func.key}/invocations`,
        headers: {
          'X-Amz-Invocation-Type': 'RequestResponse',
        },
        body: {},
        json: true,
      })

      expect(result).toEqual({ result: true })
    })
  })
})
