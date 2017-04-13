'use strict'

const BbPromise = require('bluebird')

const mockAuthorizer = {
  authorize: jest.fn(),
}

const mockPolicyValidator = {
  isAuthorized: jest.fn(),
}

jest.mock('./index', () => mockAuthorizer)
jest.mock('./policy-validator', () => mockPolicyValidator)

const middleware = require('./middleware')

describe('middleware', () => {
  const logger = jest.fn()
  let req = null
  let res = null
  let next = null

  beforeEach(() => {
    req = {
      logger,
      get: jest.fn(),
    }
    res = {
      status: jest.fn(),
      send: jest.fn(),
    }
    next = jest.fn()

    logger.mockClear()

    mockAuthorizer.authorize.mockClear()
    mockPolicyValidator.isAuthorized.mockClear()

    logger.mockImplementation((msg) => console.log(msg))
  })

  it('should invoke custom authorizer', () => {
    const lambda = {}
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: null,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
        },
      },
    }

    const policy = {
      principalId: 'principal-id',
      context: {
        userId: '22b459eb-ce07-e611-80c9-000d3aa051ca',
      },
    }

    req.method = context.http.method
    req.path = context.http.path

    req.get.mockImplementation(() => token)
    mockAuthorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))
    mockPolicyValidator.isAuthorized.mockImplementation(() => true)

    req.context = context

    return middleware(lambda)(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(1)
      expect(req.get.mock.calls[0][0]).toBe('authorization')

      expect(mockAuthorizer.authorize.mock.calls.length).toBe(1)
      expect(mockAuthorizer.authorize.mock.calls[0][0]).toBe(lambda)
      expect(mockAuthorizer.authorize.mock.calls[0][1]).toBe(context)
      expect(mockAuthorizer.authorize.mock.calls[0][2]).toBe(token)
      expect(mockAuthorizer.authorize.mock.calls[0][3]).toBe(logger)

      expect(mockPolicyValidator.isAuthorized.mock.calls.length).toBe(1)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][0]).toBe(req.method)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][1]).toBe(req.path)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][2]).toBe(policy)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][3]).toBe(logger)

      expect(next.mock.calls.length).toBe(1)
    })
  })

  it('should return unauthorized policyValidator returns false', () => {
    const lambda = {}
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/test/unauthorized',
        method: 'post',
        cors: null,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
        },
      },
    }

    const policy = {
      principalId: 'principal-id',
    }

    req.method = context.http.method
    req.path = context.http.path
    req.get.mockImplementation(() => token)
    mockAuthorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))
    mockPolicyValidator.isAuthorized.mockImplementation(() => false)

    req.context = context

    return middleware(lambda)(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(1)
      expect(req.get.mock.calls[0][0]).toBe('authorization')

      expect(mockAuthorizer.authorize.mock.calls.length).toBe(1)
      expect(mockAuthorizer.authorize.mock.calls[0][0]).toBe(lambda)
      expect(mockAuthorizer.authorize.mock.calls[0][1]).toBe(context)
      expect(mockAuthorizer.authorize.mock.calls[0][2]).toBe(token)
      expect(mockAuthorizer.authorize.mock.calls[0][3]).toBe(logger)

      expect(mockPolicyValidator.isAuthorized.mock.calls.length).toBe(1)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][0]).toBe(req.method)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][1]).toBe(req.path)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][2]).toBe(policy)
      expect(mockPolicyValidator.isAuthorized.mock.calls[0][3]).toBe(logger)

      expect(next.mock.calls.length).toBe(0)
      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(401)
      expect(res.send.mock.calls.length).toBe(1)
      expect(res.send.mock.calls[0][0]).toBe('Unauthorized')
    })
  })

  it('should skip if no custom authorizer', () => {
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: null,
        authorizer: null,
      },
    }

    req.get.mockImplementation(() => token)
    mockAuthorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.context = context

    return middleware()(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(0)
      expect(mockAuthorizer.authorize.mock.calls.length).toBe(0)
      expect(mockPolicyValidator.isAuthorized.mock.calls.length).toBe(0)
      expect(next.mock.calls.length).toBe(1)
    })
  })

  it('should skip custom authorizer if cors and OPTIONS request', () => {
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: true,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
        },
      },
    }

    req.get.mockImplementation(() => token)
    mockAuthorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.method = 'OPTIONS'
    req.context = context

    return middleware()(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(0)
      expect(mockAuthorizer.authorize.mock.calls.length).toBe(0)
      expect(mockPolicyValidator.isAuthorized.mock.calls.length).toBe(0)
      expect(next.mock.calls.length).toBe(1)
    })
  })

  it('should throw if identity source is not header', () => {
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        authorizer: {
          name: 'authorizer',
          identitySource: 'blah',
        },
      },
    }

    req.get.mockImplementation(() => token)
    mockAuthorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.context = context

    expect(() => {
      middleware()(req, res, next)
    }).toThrow()
  })
})
