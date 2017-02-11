'use strict'


const lambda = {
  event: jest.fn(),
  response: jest.fn(),
  error: jest.fn(),
}

const lambdaProxy = {
  event: jest.fn(),
  response: jest.fn(),
  error: jest.fn(),
}

jest.mock('./lambda', () => lambda)
jest.mock('./lambda-proxy', () => lambdaProxy)

const integration = require('./index')

describe('integration', () => {
  beforeEach(() => {
    lambda.event.mockClear()
    lambda.response.mockClear()
    lambdaProxy.event.mockClear()
    lambdaProxy.response.mockClear()
  })

  describe('event', () => {
    it('should invoke lambda integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      return integration.event(req).then(() => {
        expect(lambda.event.mock.calls.length).toBe(1)
        expect(lambda.event.mock.calls[0][0]).toBe(req)
      })
    })

    it('should invoke lambda-proxy integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda-proxy',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      return integration.event(req).then(() => {
        expect(lambdaProxy.event.mock.calls.length).toBe(1)
        expect(lambdaProxy.event.mock.calls[0][0]).toBe(req)
      })
    })
  })

  describe('response', () => {
    it('should invoke lambda integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      const result = {}

      return integration.response(req, result).then(() => {
        expect(lambda.response.mock.calls.length).toBe(1)
        expect(lambda.response.mock.calls[0][0]).toBe(req)
        expect(lambda.response.mock.calls[0][1]).toBe(result)
      })
    })

    it('should invoke lambda-proxy integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda-proxy',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      const result = {}

      return integration.response(req, result).then(() => {
        expect(lambdaProxy.response.mock.calls.length).toBe(1)
        expect(lambdaProxy.response.mock.calls[0][0]).toBe(req)
        expect(lambdaProxy.response.mock.calls[0][1]).toBe(result)
      })
    })
  })


  describe('error', () => {
    it('should invoke lambda integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      const err = {}

      return integration.error(req, err).then(() => {
        expect(lambda.error.mock.calls.length).toBe(1)
        expect(lambda.error.mock.calls[0][0]).toBe(req)
        expect(lambda.error.mock.calls[0][1]).toBe(err)
      })
    })

    it('should invoke lambda-proxy integration', () => {
      const req = {
        context: {
          http: {
            integration: 'lambda-proxy',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      const err = {}

      return integration.error(req, err).then(() => {
        expect(lambdaProxy.error.mock.calls.length).toBe(1)
        expect(lambdaProxy.error.mock.calls[0][0]).toBe(req)
        expect(lambdaProxy.error.mock.calls[0][1]).toBe(err)
      })
    })
  })
})
