'use strict'

const BbPromise = require('bluebird')

describe('serve', () => {
  const endpointBase = {
    functionName: 'test-func',
    region: 'us-east-1',
    stage: 'test',
    servicePath: '/test/file/path',
    handler: 'index.endpoint',
    memorySize: 512,
    timeout: 3,
    runtime: 'nodejs4.3',
    environment: {},

    http: { },
  }

  const getEndpoint = (endpoint) => Object.assign({},
    endpointBase,
    endpoint
  )

  let mockExpress = null
  let serve = null
  let mockRes = null

  beforeEach(() => {
    mockExpress = {
      use: jest.fn(),
      listen: jest.fn((port, cb) => cb(null)),

      all: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      options: jest.fn(),
      patch: jest.fn(),
    }

    mockRes = {
      status: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
    }

    jest.mock('express', () => () => mockExpress)

    serve = require('./serve') // eslint-disable-line global-require
  })

  describe('start', () => {
    it('should setup post endpoint', () => {
      const endpoints = [getEndpoint({
        http: {
          integration: 'lambda-proxy',
          path: '/test/path',
          method: 'post',
        },
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(mockExpress.post.mock.calls.length).toBe(1)
        expect(mockExpress.post.mock.calls[0][0]).toBe('/test/path')

        expect(mockExpress.options.mock.calls.length).toBe(0)
        expect(mockExpress.listen.mock.calls.length).toBe(1)
      })
    })

    it('should fail when the endpoint is missing', () => {
      expect.assertions(2)
      const endpoints = [
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{param}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{greedyParam+}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path',
            method: 'post',
          },
        }),
      ]

      const req = {
        method: 'POST',
        url: '/nonexistent/path',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      return new BbPromise((resolve) => {
        createContextMiddleware(req, mockRes, (error) => {
          expect(error).toBeTruthy()
          resolve()
        })
      })
    })

    it('should select the correct post endpoint when one endpoint path is subset', () => {
      expect.assertions(2)
      const endpoints = [
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{param}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{greedyParam+}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path',
            method: 'post',
          },
        }),
      ]

      const req = {
        method: 'POST',
        url: '/test/path',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      return new BbPromise((resolve) => {
        createContextMiddleware(req, mockRes, () => {
          expect(req.context).toBeTruthy()
          expect(req.context.http.path).toBe('/test/path')
          resolve()
        })
      })
    })

    it('should create context for the correct post endpoint', () => {
      expect.assertions(2)
      const endpoints = [
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{param}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{greedyParam+}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path',
            method: 'post',
          },
        }),
      ]

      const req = {
        method: 'POST',
        url: '/test',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      return new BbPromise((resolve) => {
        createContextMiddleware(req, mockRes, () => {
          expect(req.context).toBeTruthy()
          expect(req.context.http.path).toBe('/test')
          resolve()
        })
      })
    })

    it('should create context for the correct post endpoint with param', () => {
      expect.assertions(2)
      const endpoints = [
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{param}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{greedyParam+}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path',
            method: 'post',
          },
        }),
      ]

      const req = {
        method: 'POST',
        url: '/test/path/foo',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      return new BbPromise((resolve) => {
        createContextMiddleware(req, mockRes, () => {
          expect(req.context).toBeTruthy()
          expect(req.context.http.path).toBe('/test/path/{param}')
          resolve()
        })
      })
    })

    it('should create context for the correct post endpoint with greedy param', () => {
      expect.assertions(2)
      const endpoints = [
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path/{param}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/another/path/{greedyParam+}',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test',
            method: 'post',
          },
        }),
        getEndpoint({
          http: {
            integration: 'lambda-proxy',
            path: '/test/path',
            method: 'post',
          },
        }),
      ]

      const req = {
        method: 'POST',
        url: '/another/path/foo/bar',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      return new BbPromise((resolve) => {
        createContextMiddleware(req, mockRes, () => {
          expect(req.context).toBeTruthy()
          expect(req.context.http.path).toBe('/another/path/{greedyParam+}')
          resolve()
        })
      })
    })

    it('should setup ANY endpoint', () => {
      const endpoints = [getEndpoint({
        http: {
          integration: 'lambda-proxy',
          path: '/test/path',
          method: 'any',
        },
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(mockExpress.all.mock.calls.length).toBe(1)
        expect(mockExpress.all.mock.calls[0][0]).toBe('/test/path')

        expect(mockExpress.options.mock.calls.length).toBe(0)
        expect(mockExpress.listen.mock.calls.length).toBe(1)
      })
    })

    it('should setup path part endpoint', () => {
      const endpoints = [getEndpoint({
        http: {
          integration: 'lambda-proxy',
          path: '/test/{part}',
          method: 'get',
        },
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(mockExpress.get.mock.calls.length).toBe(1)
        expect(mockExpress.get.mock.calls[0][0]).toBe('/test/:part')

        expect(mockExpress.options.mock.calls.length).toBe(0)
        expect(mockExpress.listen.mock.calls.length).toBe(1)
      })
    })

    it('should setup greedy path endpoint', () => {
      const endpoints = [getEndpoint({
        http: {
          integration: 'lambda-proxy',
          path: '/test/{greedy+}',
          method: 'get',
        },
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(mockExpress.get.mock.calls.length).toBe(1)
        expect(mockExpress.get.mock.calls[0][0]).toBe('/test/:greedy(*)')

        expect(mockExpress.options.mock.calls.length).toBe(0)
        expect(mockExpress.listen.mock.calls.length).toBe(1)
      })
    })

    it('should setup cors endpoints', () => {
      const endpoints = [getEndpoint({
        http: {
          integration: 'lambda-proxy',
          path: '/test/path',
          method: 'post',
          cors: {
            origins: ['*'],
            methods: ['OPTIONS', 'POST'],
            headers: [
              'My-Header',
            ],
            allowCredentials: true,
          },
        },
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(mockExpress.post.mock.calls.length).toBe(1)
        expect(mockExpress.post.mock.calls[0][0]).toBe('/test/path')

        expect(mockExpress.options.mock.calls.length).toBe(1)
        expect(mockExpress.options.mock.calls[0][0]).toBe('/test/path')

        expect(mockExpress.listen.mock.calls.length).toBe(1)
      })
    })
  })
})
