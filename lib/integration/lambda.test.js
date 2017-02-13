'use strict'

const integration = require('./lambda')

describe('lambda integration', () => {
  const headers = {
    'user-agent': 'test-user-agent',
  }
  const req = {
    get: jest.fn().mockImplementation((key) => headers[key]),
    url: '/',
    method: 'GET',
    headers,
    params: {},
    query: {},
    context: {
      functionName: 'test-func',
      region: 'us-east-1',
      stage: 'test',
      servicePath: '/test/file/path',
      handler: 'index.endpoint',
      memorySize: 512,
      timeout: 3,
      runtime: 'nodejs4.3',
      environment: {},

      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: null,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
          function: {
            environment: {},
            functionName: 'authorizer',
            handler: 'index.authorizer',
            memorySize: 512,
            region: 'us-east-1',
            runtime: 'nodejs4.3',
            servicePath: '/test/file/path',
            stage: 'test',
            timeout: 3,
          },
        },
        requestTemplates: {
          '*/*': '$input.json(\'$\')',
          'application/json': '$input.json(\'$\')',
        },
        responseMappings: [{
          statusCode: 200,
          pattern: '',
          parameters: {},
          template: '',
        }, {
          statusCode: 400,
          pattern: '.*\\[400\\].*',
          parameters: {},
          template: '',
        }],
      },
    },
    connection: {
      remoteAddress: '127.0.0.1',
    },
    body: {
      hello: 'world',
    },
    user: {
      principalId: '12345',
    },
  }

  describe('event', () => {
    it('execute event', () => {
      const expected = {
        hello: 'world',
      }

      const actual = integration.event(req)

      expect(actual).toEqual(expected)
    })
  })

  describe('response', () => {
    it('execute response', () => {
      const result = { foo: 'bar' }
      const expected = {
        statusCode: 200,
        body: result,
      }

      const actual = integration.response(req, result)
      expect(actual).toEqual(expected)
    })
  })

  describe('error', () => {
    it('should create error response', () => {
      const err = 'Unexpected error'

      expect(integration.error(req, err)).toEqual({
        statusCode: 200,
        body: {
          errorMessage: 'Unexpected error',
        },
      })
    })
  })
})
