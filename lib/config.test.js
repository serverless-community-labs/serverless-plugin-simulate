'use strict'

const config = require('./config')

describe('config', () => {
  describe('getEndpoints', () => {
    let service = null

    beforeEach(() => {
      service = {
        getAllFunctions: jest.fn(),
        getFunction: jest.fn(),

        defaults: {
          region: 'us-east-1',
          stage: 'test',
        },
        serverless: {
          config: {
            servicePath: '/test/file/path',
          },
        },
      }
    })

    it('should add function and http info to context', () => {
      const functionName = 'test-func'
      const functionConfig = {
        name: functionName,
        events: [{
          http: {
            path: 'test/path',
            method: 'post',
            cors: true,
            authorizer: 'authorizer',
          },
        }],
      }

      service.getAllFunctions.mockImplementationOnce(() => [functionName])
      service.getFunction.mockImplementation(() => functionConfig)

      const endpoints = config.getEndpoints(service)

      expect(service.getAllFunctions.mock.calls.length).toBe(1)
      expect(service.getFunction.mock.calls.length).toBe(3)

      expect(endpoints).toEqual([{
        region: service.defaults.region,
        stage: service.defaults.stage,
        name: functionName,
        functionName,
        functionPath: '/test/file/path',
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: true,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
        },
      }])
    })

    it('should add function and http info to context - authorizer object no identitySource', () => {
      const functionName = 'test-func'
      const functionConfig = {
        name: functionName,
        events: [{
          http: {
            path: 'test/path',
            method: 'post',
            cors: true,
            authorizer: {
              name: 'authorizerFunc',
            },
          },
        }],
      }

      service.getAllFunctions.mockImplementationOnce(() => [functionName])
      service.getFunction.mockImplementation(() => functionConfig)

      const endpoints = config.getEndpoints(service)

      expect(service.getAllFunctions.mock.calls.length).toBe(1)
      expect(service.getFunction.mock.calls.length).toBe(3)

      expect(endpoints).toEqual([{
        region: service.defaults.region,
        stage: service.defaults.stage,
        name: functionName,
        functionName,
        functionPath: '/test/file/path',
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: true,
        authorizer: {
          name: 'authorizerFunc',
          identitySource: 'method.request.header.Authorization',
        },
      }])
    })

    it('add function and http info to context - authorizer object custom identitySource', () => {
      const functionName = 'test-func'
      const functionConfig = {
        name: functionName,
        events: [{
          http: {
            path: 'test/path',
            method: 'post',
            cors: true,
            authorizer: {
              name: 'authorizerFunc',
              identitySource: 'method.request.header.Auth',
            },
          },
        }],
      }

      service.getAllFunctions.mockImplementationOnce(() => [functionName])
      service.getFunction.mockImplementation(() => functionConfig)

      const endpoints = config.getEndpoints(service)

      expect(service.getAllFunctions.mock.calls.length).toBe(1)
      expect(service.getFunction.mock.calls.length).toBe(3)

      expect(endpoints).toEqual([{
        region: service.defaults.region,
        stage: service.defaults.stage,
        name: functionName,
        functionName,
        functionPath: '/test/file/path',
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: true,
        authorizer: {
          name: 'authorizerFunc',
          identitySource: 'method.request.header.Auth',
        },
      }])
    })
  })

  describe('getCorsConfig', () => {
    it('should return default config if cors:true', () => {
      const corsConfig = config.getCorsConfig('post', true)

      expect(corsConfig).toEqual({
        origins: ['*'],
        methods: ['OPTIONS', 'POST'],
        headers: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: false,
      })
    })

    it('should return user config if cors:object', () => {
      const corsConfig = config.getCorsConfig('post', {
        origins: ['http://localhost'],
        headers: [
          'My-Custom-Header',
        ],
        allowCredentials: true,
      })

      expect(corsConfig).toEqual({
        origins: ['http://localhost'],
        methods: ['OPTIONS', 'POST'],
        headers: [
          'My-Custom-Header',
        ],
        allowCredentials: true,
      })
    })

    it('should error if headers not an array', () => {
      expect(() => {
        config.getCorsConfig('post', {
          headers: 'bad-value',
        })
      }).toThrow()
    })
  })
})
