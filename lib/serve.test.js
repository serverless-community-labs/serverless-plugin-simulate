'use strict'

describe('serve', () => {
  const endpointBase = {
    region: 'us-east-1',
    stage: 'test',
    name: 'test-func',
    functionName: 'test-func',
    functionPath: '/test/file/path',
  }

  const getEndpoint = (endpoint) => Object.assign({},
    endpointBase,
    endpoint
  )

  let express = null
  let serve = null

  beforeEach(() => {
    express = {
      use: jest.fn(),
      listen: jest.fn((port, cb) => cb(null)),

      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      options: jest.fn(),
      patch: jest.fn(),
    }

    jest.mock('express', () => () => express)

    serve = require('./serve') // eslint-disable-line global-require
  })

  describe('start', () => {
    it('should setup post endpoint', () => {
      const endpoints = [getEndpoint({
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(express.post.mock.calls.length).toBe(1)
        expect(express.options.mock.calls.length).toBe(0)
        expect(express.listen.mock.calls.length).toBe(1)
      })
    })

    it('should setup cors endpoints', () => {
      const endpoints = [getEndpoint({
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: true,
      })]

      const port = 5000

      return serve.start(endpoints, port).then(() => {
        expect(express.post.mock.calls.length).toBe(1)
        expect(express.options.mock.calls.length).toBe(1)
        expect(express.listen.mock.calls.length).toBe(1)
      })
    })
  })
})
