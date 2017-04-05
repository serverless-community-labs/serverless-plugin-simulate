'use strict'

const config = require('./config')

describe('config', () => {
  describe('getEndpoints', () => {
    let serverless = null
    let functions = null

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
        // 'test-func-lambda': {
        //   name: 'test-func',
        //   handler: 'index.endpoint',
        //   events: [{
        //     http: {
        //       path: 'test/path',
        //       method: 'post',
        //       integration: 'lambda',
        //       request: {
        //         template: {
        //           'application/json': '',
        //         },
        //       },
        //       response: {
        //         headers: {

        //         },
        //         template: '',
        //         statusCodes: {
        //           201: {
        //             pattern: '',
        //           },
        //           409: {
        //             headers: {},
        //             template: '',
        //             pattern: '.*\\[400\\].*',
        //           },
        //         },
        //       },
        //     },
        //   }],
        // },
        authorizer: {
          name: 'authorizer',
          handler: 'index.authorizer',
        },
      }

      serverless.service.getAllFunctions.mockImplementation(() => Object.keys(functions))
      serverless.service.getFunction.mockImplementation((name) => functions[name])
    })

    it('should get function config', () => {
      serverless.service.custom = {
        simulate: {
          services: {
            projectName: 'test-project',
          },
        },
      }

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
        projectName: 'testproject',
      })
    })

    it('should get function config with project name', () => {
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
      expect(serverless.service.getFunction.mock.calls.length).toBe(2)

      expect(endpoints).toEqual({
        corsMethodsForPath: {},
        endpoints: [{
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
        }],
      })
    })

    it('should get endpoints - cors:true', () => {
      functions['test-func'].events[0].http.cors = true

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(2)

      expect(endpoints).toEqual({
        corsMethodsForPath: {
          '/test/path': ['OPTIONS', 'POST'],
        },
        endpoints: [{
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
        }],
      })
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
      expect(serverless.service.getFunction.mock.calls.length).toBe(2)

      expect(endpoints).toEqual({
        corsMethodsForPath: {
          '/test/path': ['OPTIONS', 'POST'],
        },
        endpoints: [{
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
        }],
      })
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
      expect(serverless.service.getFunction.mock.calls.length).toBe(2)

      expect(endpoints).toEqual({
        corsMethodsForPath: {
        },
        endpoints: [{
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
        }],
      })
    })

    it('add get endpoints - authorizer object custom identitySource', () => {
      functions['test-func'].events[0].http.authorizer = {
        name: 'authorizer',
        identitySource: 'method.request.header.Auth',
      }

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(2)

      expect(endpoints).toEqual({
        corsMethodsForPath: {
        },
        endpoints: [{
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
        }],
      })
    })

    it('should get endpoints for multiple functions', () => {
      functions['test-func-2'] = {
        name: 'test-func',
        handler: 'index.subpath',
        events: [{
          http: {
            path: 'test/path/sub',
            method: 'post',
          },
        }],
      }

      const endpoints = config.getEndpoints(serverless)

      expect(serverless.service.getAllFunctions.mock.calls.length).toBe(1)
      expect(serverless.service.getFunction.mock.calls.length).toBe(3)

      expect(endpoints).toEqual({
        corsMethodsForPath: {},
        endpoints: [{
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
        }, {
          key: 'test-service-test-test-func-2',
          serviceName: 'test-service',
          functionName: 'test-func-2',
          region: 'us-east-1',
          stage: 'test',
          servicePath: '/test/file/path',
          handler: 'index.subpath',
          memorySize: 512,
          timeout: 3,
          runtime: 'nodejs4.3',
          environment: {},

          http: {
            authorizer: null,
            integration: 'lambda-proxy',
            path: '/test/path/sub',
            method: 'post',
            cors: null,
          },
        }],
      })
    })
  })

  describe('getMockServices', () => {
    it('should get mock services config from custom', () => {
      const serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          provider: {},
          custom: {
            simulate: {
              services: 'docker-compose1.yml',
            },
          },
        },
      }

      const mockConfig = config.getMockServices(serverless)

      expect(mockConfig).toEqual({
        file: 'docker-compose1.yml',
      })
    })

    it('should get mock services config from custom', () => {
      const serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          provider: {},
          custom: {
            simulate: {
              services: {
                file: 'docker-compose1.yml',
              },
            },
          },
        },
      }

      const mockConfig = config.getMockServices(serverless)

      expect(mockConfig).toEqual({
        file: 'docker-compose1.yml',
      })
    })

    it('should get mock services config from cli', () => {
      const serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          provider: {},
        },
      }

      const mockConfig = config.getMockServices(serverless, 'docker-compose.yml', 'host')

      expect(mockConfig).toEqual({
        file: 'docker-compose.yml',
        host: 'host',
      })
    })

    it('should get mock services config from custom with project name', () => {
      const serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          provider: {},
          custom: {
            simulate: {
              services: {
                file: 'docker-compose1.yml',
                projectName: 'test',
              },
            },
          },
        },
      }

      const mockConfig = config.getMockServices(serverless)

      expect(mockConfig).toEqual({
        file: 'docker-compose1.yml',
        projectName: 'test',
      })
    })

    it('should get mock services config from custom with normalized project name', () => {
      const serverless = {
        config: {
          servicePath: '/test/file/path',
        },
        service: {
          service: 'test-service',
          provider: {},
          custom: {
            simulate: {
              services: {
                file: 'docker-compose1.yml',
                projectName: 'TEST_-123',
              },
            },
          },
        },
      }

      const mockConfig = config.getMockServices(serverless)

      expect(mockConfig).toEqual({
        file: 'docker-compose1.yml',
        projectName: 'test123',
      })
    })
  })
})
