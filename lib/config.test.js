'use strict'

const config = require('./config')

describe('config', () => {
  describe('getEndpoints', () => {
    let serverless = null
    let functions = null
    let functionNames = null
    let numFunctions = null

    beforeEach(() => {
      serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          getAllFunctions: jest.fn(),
          getFunction: jest.fn(),
          provider: {
            environment: {},
            region: 'us-east-1',
            stage: 'test',
            runtime: 'nodejs4.3',
            memorySize: 512,
            timeout: 3,
          },
        },
      }

      functions = {
        'test-func': {
          name: 'test-func',
          handler: 'index.endpoint',
          events: [{
            http: {
              path: 'test/path',
              method: 'post',
            },
          }],
        },
        authorizer: {
          name: 'authorizer',
          handler: 'index.authorizer',
        },
      }

      functionNames = Object.keys(functions)
      numFunctions = functionNames.length

      serverless.service.getAllFunctions.mockImplementation(() => functionNames)
      serverless.service.getFunction.mockImplementation((name) => functions[name])
    })

    it('should get function config', () => {
      const functionConfig = config.getFunctionConfig(serverless, 'test-func')

      expect(functionConfig).toEqual({
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
        functionName: 'test-func',
        region: 'us-east-1',
        stage: 'test',
        servicePath: '/test/file/path',
        handler: 'index.endpoint',
        memorySize: 512,
        timeout: 3,
        runtime: 'nodejs4.3',
        environment: {},
      })
    })

    it('should get endpoints', () => {
      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(numFunctions)

      expect(endpoints).toEqual([{
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
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
          authorizer: null,
          integration: 'lambda-proxy',
          path: '/test/path',
          method: 'post',
          cors: null,
        },
      }])
    })

    it('should get endpoints - cors:true', () => {
      functions['test-func'].events[0].http.cors = true

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(numFunctions)

      expect(endpoints).toEqual([{
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
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
          authorizer: null,
          integration: 'lambda-proxy',
          path: '/test/path',
          method: 'post',
          cors: {
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
          },
        },
      }])
    })

    it('add get endpoints - cors:object', () => {
      functions['test-func'].events[0].http.cors = {
        origins: ['*'],
        headers: [
          'My-Header',
        ],
        allowCredentials: true,
      }

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(numFunctions)

      expect(endpoints).toEqual([{
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
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
          authorizer: null,
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
      }])
    })

    it('should error if cors headers not an array', () => {
      functions['test-func'].events[0].http.cors = {
        headers: 'bad-value',
      }
      expect(() => {
        config.getEndpoints(serverless)
      }).toThrow()
    })

    it('should get endpoints - authorizer object no identitySource', () => {
      functions['test-func'].events[0].http.authorizer = 'authorizer'

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(numFunctions)

      expect(endpoints).toEqual([{
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
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
              key: 'test-service-test-authorizer',
              serviceName: 'test-service',
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
        },
      }])
    })

    it('add get endpoints - authorizer object custom identitySource', () => {
      functions['test-func'].events[0].http.authorizer = {
        name: 'authorizer',
        identitySource: 'method.request.header.Auth',
      }

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(numFunctions)

      expect(endpoints).toEqual([{
        key: 'test-service-test-test-func',
        serviceName: 'test-service',
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
            identitySource: 'method.request.header.Auth',
            function: {
              key: 'test-service-test-authorizer',
              serviceName: 'test-service',
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
        },
      }])
    })
  })
})
