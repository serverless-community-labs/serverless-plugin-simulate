'use strict'

jest.mock('./index', () => ({
  event: jest.fn(),
  response: jest.fn(),
  error: jest.fn(),
}))

const lambda = {
  invoke: jest.fn(),
}

const BbPromise = require('bluebird')
const middleware = require('./middleware')
const integration = require('./index')

describe('middleware', () => {
  beforeEach(() => {
    integration.event.mockClear()
    integration.response.mockClear()
    integration.error.mockClear()
    lambda.invoke.mockClear()
  })

  it('should invoke create event, invoke lambda and return response', (done) => {
    const req = {
      logger: jest.fn(),
      context: {
        functionName: 'test-func',
      },
    }
    const res = {
      status: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    }

    const event = {}
    const invokeResult = {}
    const response = {
      statusCode: 400,
      headers: {},
      body: 'blah',
    }

    integration.event.mockImplementation(() => BbPromise.resolve(event))
    integration.response.mockImplementation(() => BbPromise.resolve(response))
    integration.error.mockImplementation(() => BbPromise.resolve())
    lambda.invoke.mockImplementation(() => BbPromise.resolve(invokeResult))

    middleware(lambda, () => {
      expect(integration.error.mock.calls.length).toBe(0)

      expect(integration.event.mock.calls.length).toBe(1)
      expect(integration.event.mock.calls[0][0]).toBe(req)

      expect(lambda.invoke.mock.calls.length).toBe(1)
      expect(lambda.invoke.mock.calls[0][0]).toBe(req.context)
      expect(lambda.invoke.mock.calls[0][1]).toBe(event)
      expect(lambda.invoke.mock.calls[0][2]).toBe(req.logger)

      expect(integration.response.mock.calls.length).toBe(1)
      expect(integration.response.mock.calls[0][0]).toBe(req)
      expect(integration.response.mock.calls[0][1]).toBe(invokeResult)

      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(response.statusCode)

      expect(res.set.mock.calls.length).toBe(1)
      expect(res.set.mock.calls[0][0]).toBe(response.headers)

      expect(res.send.mock.calls.length).toBe(1)
      expect(res.send.mock.calls[0][0]).toBe(response.body)

      done()
    })(req, res)
  })

  it('should invoke create event, invoke lambda and return error when lambda fails', (done) => {
    const req = {
      logger: jest.fn(),
      context: {
        functionName: 'test-func',
      },
    }
    const res = {
      status: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    }

    const event = {}
    const invokeResult = new Error('blah')
    const response = {
      statusCode: 500,
    }

    integration.event.mockImplementation(() => BbPromise.resolve(event))
    integration.response.mockImplementation(() => BbPromise.resolve())
    integration.error.mockImplementation(() => BbPromise.resolve(response))
    lambda.invoke.mockImplementation(() => BbPromise.reject(invokeResult))

    middleware(lambda, () => {
      expect(integration.response.mock.calls.length).toBe(0)

      expect(integration.event.mock.calls.length).toBe(1)
      expect(integration.event.mock.calls[0][0]).toBe(req)

      expect(lambda.invoke.mock.calls.length).toBe(1)
      expect(lambda.invoke.mock.calls[0][0]).toBe(req.context)
      expect(lambda.invoke.mock.calls[0][1]).toBe(event)
      expect(lambda.invoke.mock.calls[0][2]).toBe(req.logger)

      expect(integration.error.mock.calls.length).toBe(1)
      expect(integration.error.mock.calls[0][0]).toBe(req)
      expect(integration.error.mock.calls[0][1]).toBe(invokeResult)

      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(response.statusCode)

      expect(res.set.mock.calls.length).toBe(1)
      expect(res.set.mock.calls[0][0]).toEqual({})

      expect(res.send.mock.calls.length).toBe(1)
      expect(res.send.mock.calls[0][0]).toBeUndefined()

      done()
    })(req, res)
  })

  it('should invoke create event, invoke lambda and return error when lambda fails and integration fails', (done) => {
    const req = {
      logger: jest.fn(),
      context: {
        functionName: 'test-func',
      },
    }
    const res = {
      status: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    }

    const event = {}
    const invokeResult = new Error('blah')
    const errorResult = new Error('blah')

    integration.event.mockImplementation(() => BbPromise.resolve(event))
    integration.response.mockImplementation(() => BbPromise.resolve())
    integration.error.mockImplementation(() => BbPromise.reject(errorResult))
    lambda.invoke.mockImplementation(() => BbPromise.reject(invokeResult))

    middleware(lambda, () => {
      expect(integration.response.mock.calls.length).toBe(0)

      expect(integration.event.mock.calls.length).toBe(1)
      expect(integration.event.mock.calls[0][0]).toBe(req)

      expect(lambda.invoke.mock.calls.length).toBe(1)
      expect(lambda.invoke.mock.calls[0][0]).toBe(req.context)
      expect(lambda.invoke.mock.calls[0][1]).toBe(event)
      expect(lambda.invoke.mock.calls[0][2]).toBe(req.logger)

      expect(integration.error.mock.calls.length).toBe(1)
      expect(integration.error.mock.calls[0][0]).toBe(req)
      expect(integration.error.mock.calls[0][1]).toBe(invokeResult)

      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(500)

      expect(res.set.mock.calls.length).toBe(1)
      expect(res.set.mock.calls[0][0]).toEqual({})

      expect(res.send.mock.calls.length).toBe(1)

      const errorResponse = res.send.mock.calls[0][0]

      expect(errorResponse.stack).toBeDefined()
      delete errorResponse.stack

      expect(errorResponse).toEqual({
        errorMessage: 'SIMULATE ERROR: blah',
      })

      done()
    })(req, res)
  })
})
