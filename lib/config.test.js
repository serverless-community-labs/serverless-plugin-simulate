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

    it('add function and http info to context', () => {
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
        },
      }])
    })
  })
})
