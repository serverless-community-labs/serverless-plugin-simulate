'use strict'


const mockLambda = {
  event: jest.fn(),
  response: jest.fn(),
  error: jest.fn(),
}

const mockLambdaProxy = {
  event: jest.fn(),
  response: jest.fn(),
  error: jest.fn(),
}

jest.mock('./lambda', () => mockLambda)
jest.mock('./lambda-proxy', () => mockLambdaProxy)

const integration = require('./index')

describe('integration', () => {
  beforeEach(() => {
    mockLambda.event.mockClear()
    mockLambda.response.mockClear()
    mockLambdaProxy.event.mockClear()
    mockLambdaProxy.response.mockClear()
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
        expect(mockLambda.event.mock.calls.length).toBe(1)
        expect(mockLambda.event.mock.calls[0][0]).toBe(req)
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
        expect(mockLambdaProxy.event.mock.calls.length).toBe(1)
        expect(mockLambdaProxy.event.mock.calls[0][0]).toBe(req)
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
        expect(mockLambda.response.mock.calls.length).toBe(1)
        expect(mockLambda.response.mock.calls[0][0]).toBe(req)
        expect(mockLambda.response.mock.calls[0][1]).toBe(result)
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
        expect(mockLambdaProxy.response.mock.calls.length).toBe(1)
        expect(mockLambdaProxy.response.mock.calls[0][0]).toBe(req)
        expect(mockLambdaProxy.response.mock.calls[0][1]).toBe(result)
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
        expect(mockLambda.error.mock.calls.length).toBe(1)
        expect(mockLambda.error.mock.calls[0][0]).toBe(req)
        expect(mockLambda.error.mock.calls[0][1]).toBe(err)
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
        expect(mockLambdaProxy.error.mock.calls.length).toBe(1)
        expect(mockLambdaProxy.error.mock.calls[0][0]).toBe(req)
        expect(mockLambdaProxy.error.mock.calls[0][1]).toBe(err)
      })
    })

    it('should fail getting a fake integration', () => {
      expect.assertions(1)
      const req = {
        context: {
          http: {
            integration: 'fake',
          },
        },
        logger: (msg) => console.log(msg), // eslint-disable-line no-console
      }

      const err = {}

      return integration.event(req, err).catch((error) => {
        expect(error).toEqual(new Error('Invalid integration type fake'))
      })
    })
  })
})
