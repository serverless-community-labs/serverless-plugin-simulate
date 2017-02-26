'use strict'

const BbPromise = require('bluebird')

const authorizer = {
  authorize: jest.fn(),
}

jest.mock('./index', () => authorizer)

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
    authorizer.authorize.mockClear()

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
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/*/test/*',
          ],
        }],
      },
    }

    req.method = context.http.method
    req.path = context.http.path
    req.get.mockImplementation(() => token)
    authorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))

    req.context = context

    return middleware(lambda)(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(1)
      expect(req.get.mock.calls[0][0]).toBe('authorization')

      expect(authorizer.authorize.mock.calls.length).toBe(1)
      expect(authorizer.authorize.mock.calls[0][0]).toBe(lambda)
      expect(authorizer.authorize.mock.calls[0][1]).toBe(context)
      expect(authorizer.authorize.mock.calls[0][2]).toBe(token)
      expect(authorizer.authorize.mock.calls[0][3]).toBe(logger)

      expect(next.mock.calls.length).toBe(1)
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
    authorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.context = context

    return middleware()(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(0)
      expect(authorizer.authorize.mock.calls.length).toBe(0)
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
    authorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.method = 'OPTIONS'
    req.context = context

    return middleware()(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(0)
      expect(authorizer.authorize.mock.calls.length).toBe(0)
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
    authorizer.authorize.mockImplementation(() => BbPromise.resolve())

    req.context = context

    expect(() => {
      middleware()(req, res, next)
    }).toThrow()
  })

  it('should return unauthorized if path not allowed due to no match', () => {
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
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/*/users/*',
          ],
        }],
      },
    }

    req.method = context.http.method
    req.path = context.http.path
    req.get.mockImplementation(() => token)
    authorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))

    req.context = context

    return middleware(lambda)(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(1)
      expect(req.get.mock.calls[0][0]).toBe('authorization')

      expect(authorizer.authorize.mock.calls.length).toBe(1)
      expect(authorizer.authorize.mock.calls[0][0]).toBe(lambda)
      expect(authorizer.authorize.mock.calls[0][1]).toBe(context)
      expect(authorizer.authorize.mock.calls[0][2]).toBe(token)
      expect(authorizer.authorize.mock.calls[0][3]).toBe(logger)

      expect(next.mock.calls.length).toBe(0)
      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(401)
      expect(res.send.mock.calls.length).toBe(1)
      expect(res.send.mock.calls[0][0]).toBe('Unauthorized')
    })
  })

  it('should return unauthorized if method not allowed', () => {
    const lambda = {}
    const token = 'token'
    const context = {
      http: {
        integration: 'lambda-proxy',
        path: '/pets/my-pet',
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
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/GET/pets/*',
          ],
        }, {
          Effect: 'Deny',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/POST/pets/*',
          ],
        }],
      },
    }

    req.method = context.http.method
    req.path = context.http.path
    req.get.mockImplementation(() => token)
    authorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))

    req.context = context

    return middleware(lambda)(req, res, next).then(() => {
      expect(req.get.mock.calls.length).toBe(1)
      expect(req.get.mock.calls[0][0]).toBe('authorization')

      expect(authorizer.authorize.mock.calls.length).toBe(1)
      expect(authorizer.authorize.mock.calls[0][0]).toBe(lambda)
      expect(authorizer.authorize.mock.calls[0][1]).toBe(context)
      expect(authorizer.authorize.mock.calls[0][2]).toBe(token)
      expect(authorizer.authorize.mock.calls[0][3]).toBe(logger)

      expect(next.mock.calls.length).toBe(0)
      expect(res.status.mock.calls.length).toBe(1)
      expect(res.status.mock.calls[0][0]).toBe(401)
      expect(res.send.mock.calls.length).toBe(1)
      expect(res.send.mock.calls[0][0]).toBe('Unauthorized')
    })
  })

  // Not sure how to deal with path specificity yet
  // it('should return unauthorized if more specific path is denied', () => {
  //   const lambda = {}
  //   const token = 'token'
  //   const context = {
  //     http: {
  //       integration: 'lambda-proxy',
  //       path: '/pets/my-pet',
  //       method: 'post',
  //       cors: null,
  //       authorizer: {
  //         name: 'authorizer',
  //         identitySource: 'method.request.header.Authorization',
  //       },
  //     },
  //   }

  //   const policy = {
  //     principalId: 'principal-id',
  //     policyDocument: {
  //       Version: '2012-10-17',
  //       Statement: [{
  //         Effect: 'Allow',
  //         Action: [
  //           'execute-api:Invoke',
  //         ],
  //         Resource: [
  //           'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/*/*',
  //         ],
  //       }, {
  //         Effect: 'Deny',
  //         Action: [
  //           'execute-api:Invoke',
  //         ],
  //         Resource: [
  //           'arn:aws:execute-api:us-east-1:<Account id>:<API id>:/dev/*/pets/*',
  //         ],
  //       }],
  //     },
  //   }

  //   req.method = context.http.method
  //   req.path = context.http.path
  //   req.get.mockImplementation(() => token)
  //   authorizer.authorize.mockImplementation(() => BbPromise.resolve(policy))

  //   req.context = context

  //   return middleware(lambda)(req, res, next).then(() => {
  //     expect(req.get.mock.calls.length).toBe(1)
  //     expect(req.get.mock.calls[0][0]).toBe('authorization')

  //     expect(authorizer.authorize.mock.calls.length).toBe(1)
  //     expect(authorizer.authorize.mock.calls[0][0]).toBe(lambda)
  //     expect(authorizer.authorize.mock.calls[0][1]).toBe(context)
  //     expect(authorizer.authorize.mock.calls[0][2]).toBe(token)
  //     expect(authorizer.authorize.mock.calls[0][3]).toBe(logger)

  //     expect(next.mock.calls.length).toBe(0)
  //     expect(res.status.mock.calls.length).toBe(1)
  //     expect(res.status.mock.calls[0][0]).toBe(401)
  //     expect(res.send.mock.calls.length).toBe(1)
  //     expect(res.send.mock.calls[0][0]).toBe('Unauthorized')
  //   })
  // })
})
