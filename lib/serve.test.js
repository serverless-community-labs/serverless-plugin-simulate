'use strict'

jest.mock('express', () => {
  const express = {
    use: jest.fn(),
    listen: jest.fn((port, cb) => cb(null)),

    all: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    options: jest.fn(),
    patch: jest.fn(),
  }

  return () => express
})

jest.mock('./router', () => ({
  getEndpoint: jest.fn(),
  toExpressPath: jest.fn(),
}))

const express = require('express')()
const router = require('./router')
const serve = require('./serve')

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

  let res = null

  beforeEach(() => {
    express.use.mockClear()
    express.listen.mockClear()

    express.all.mockClear()
    express.get.mockClear()
    express.put.mockClear()
    express.post.mockClear()
    express.options.mockClear()
    express.patch.mockClear()

    router.getEndpoint.mockClear()
    router.toExpressPath.mockClear()
    router.toExpressPath.mockImplementation(() => 'express-router-path')

    res = {
      status: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
    }
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
        expect(express.post.mock.calls.length).toBe(1)
        expect(express.post.mock.calls[0][0]).toBe('express-router-path')

        expect(express.options.mock.calls.length).toBe(0)
        expect(express.listen.mock.calls.length).toBe(1)
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
        expect(express.all.mock.calls.length).toBe(1)
        expect(express.all.mock.calls[0][0]).toBe('express-router-path')

        expect(express.options.mock.calls.length).toBe(0)
        expect(express.listen.mock.calls.length).toBe(1)
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
        expect(express.get.mock.calls.length).toBe(1)
        expect(express.get.mock.calls[0][0]).toBe('express-router-path')

        expect(express.options.mock.calls.length).toBe(0)
        expect(express.listen.mock.calls.length).toBe(1)
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
        expect(express.get.mock.calls.length).toBe(1)
        expect(express.get.mock.calls[0][0]).toBe('express-router-path')

        expect(express.options.mock.calls.length).toBe(0)
        expect(express.listen.mock.calls.length).toBe(1)
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
        expect(express.post.mock.calls.length).toBe(1)
        expect(express.post.mock.calls[0][0]).toBe('express-router-path')

        expect(express.options.mock.calls.length).toBe(1)
        expect(express.options.mock.calls[0][0]).toBe('/test/path')

        expect(express.listen.mock.calls.length).toBe(1)
      })
    })

    it('should create context for endpoint', (done) => {
      expect.assertions(4)

      const endpoint = {}
      router.getEndpoint.mockImplementation(() => endpoint)

      const endpoints = []

      const req = {
        method: 'POST',
        url: '/nonexistent/path',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      createContextMiddleware(req, res, () => {
        expect(router.getEndpoint.mock.calls.length).toBe(1)
        expect(router.getEndpoint.mock.calls[0][0]).toBe(endpoints)
        expect(router.getEndpoint.mock.calls[0][1]).toBe(req)

        expect(req.context).toBe(endpoint)
        done()
      })
    })

    it('should fail when the endpoint is missing', (done) => {
      expect.assertions(4)

      router.getEndpoint.mockImplementation(() => null)

      const endpoints = []

      const req = {
        method: 'POST',
        url: '/nonexistent/path',
        logger: (message) => {
          console.log(message)
        },
      }

      const createContextMiddleware = serve.createContext(endpoints)

      createContextMiddleware(req, res, (error) => {
        expect(router.getEndpoint.mock.calls.length).toBe(1)
        expect(router.getEndpoint.mock.calls[0][0]).toBe(endpoints)
        expect(router.getEndpoint.mock.calls[0][1]).toBe(req)

        expect(error).toBeTruthy()
        done()
      })
    })
  })
})
