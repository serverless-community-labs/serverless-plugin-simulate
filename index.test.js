'use strict'

const BbPromise = require('bluebird')
const Simulate = require('./index')

jest.mock('./lib/config', () => ({
  getMockServices: jest.fn(),
  getFunctions: jest.fn(),
  getEndpoints: jest.fn(),
}))

jest.mock('./lib/lambda', () => ({
  register: jest.fn(),
  start: jest.fn(),
}))

jest.mock('./lib/serve', () => ({
  start: jest.fn(),
}))

jest.mock('./lib/services', () => ({
  start: jest.fn(),
}))

const config = require('./lib/config')
const lambda = require('./lib/lambda')
const serve = require('./lib/serve')
const services = require('./lib/services')

describe('index', () => {
  beforeEach(() => {
    config.getMockServices.mockClear()
    config.getFunctions.mockClear()
    config.getEndpoints.mockClear()

    lambda.register.mockClear()
    lambda.start.mockClear()

    serve.start.mockClear()

    services.start.mockClear()
  })

  it('should get dist config in Simulate instance', () => {
    const serverless = {
      service: {
        custom: {
          simulate: {
            dist: 'dist',
          },
        },
      },
    }
    const instance = new Simulate(serverless, {})
    expect(instance.dist).toBe('/dist')
  })

  it('should get dist config in Simulate instance is empty', () => {
    const serverless = {
      service: {
        custom: {
          simulate: {
          },
        },
      },
    }
    const instance = new Simulate(serverless, {})
    expect(instance.dist).toBe('')
  })

  it('should get dist config in Simulate instance is missing', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const instance = new Simulate(serverless, {})
    expect(instance.dist).toBe('')
  })

  it('should start services', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const options = {
      'dc-file': 'dc-file',
      'dc-host': 'dc-host',
    }

    const mockServices = {}
    config.getMockServices.mockImplementation(() => mockServices)

    const instance = new Simulate(serverless, options)

    instance.servicesStart()

    expect(config.getMockServices.mock.calls.length).toBe(1)
    expect(config.getMockServices.mock.calls[0][0]).toBe(serverless)
    expect(config.getMockServices.mock.calls[0][1]).toBe(options['dc-file'])
    expect(config.getMockServices.mock.calls[0][2]).toBe(options['dc-host'])

    expect(services.start.mock.calls.length).toBe(1)
    expect(services.start.mock.calls[0][0]).toBe(mockServices)
  })

  it('should skip registering functions with api gateway if no lambda port', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const options = {}

    const instance = new Simulate(serverless, options)

    return instance.apigatewayInit().then(() => {
      expect(config.getFunctions.mock.calls.length).toBe(0)
      expect(lambda.register.mock.calls.length).toBe(0)
    })
  })

  it('should register functions with api gateway', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const options = {
      'lambda-port': 4000,
    }

    const functions = {}
    config.getFunctions.mockImplementation(() => functions)
    lambda.register.mockImplementation(() => BbPromise.resolve())

    const instance = new Simulate(serverless, options)

    return instance.apigatewayInit().then(() => {
      expect(config.getFunctions.mock.calls.length).toBe(1)
      expect(config.getFunctions.mock.calls[0][0]).toBe(serverless)

      expect(lambda.register.mock.calls.length).toBe(1)
      expect(lambda.register.mock.calls[0][0]).toBe(options['lambda-port'])
      expect(lambda.register.mock.calls[0][1]).toBe(functions)
    })
  })

  it('should start api gateway', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const options = {
      port: 5000,
      'lambda-port': 4000,
    }

    const endpointsResult = {
      endpoints: [],
    }

    config.getEndpoints.mockImplementation(() => endpointsResult)
    serve.start.mockImplementation(() => BbPromise.resolve())

    const instance = new Simulate(serverless, options)

    return instance.apigatewayStart().then(() => {
      expect(config.getEndpoints.mock.calls.length).toBe(1)
      expect(config.getEndpoints.mock.calls[0][0]).toBe(serverless)

      expect(serve.start.mock.calls.length).toBe(1)
      expect(serve.start.mock.calls[0][0]).toBe(endpointsResult.endpoints)
      expect(serve.start.mock.calls[0][1]).toBe(endpointsResult.corsMethodsForPath)
      expect(serve.start.mock.calls[0][2]).toBe(options.port)
      expect(serve.start.mock.calls[0][3]).toBe(options['lambda-port'])
    })
  })

  it('should start lambda', () => {
    const serverless = {
      config: {
        servicePath: './service-path',
      },
      service: {
        custom: {
        },
      },
    }
    const options = {
      port: 4000,
    }

    const functions = {}
    config.getMockServices.mockImplementation(() => functions)
    lambda.start.mockImplementation(() => BbPromise.resolve())

    const instance = new Simulate(serverless, options)

    return instance.lambda().then(() => {
      expect(lambda.start.mock.calls.length).toBe(1)
      expect(lambda.start.mock.calls[0][0]).toBe(options.port)
      expect(lambda.start.mock.calls[0][1]).toBe('service-path/.sls-simulate-registry')
      expect(lambda.start.mock.calls[0][2]).toBe('')
    })
  })

  it('should register lambda functions', () => {
    const serverless = {
      service: {
        custom: {
        },
      },
    }
    const options = {
      'lambda-port': 4000,
    }

    const functions = {}
    config.getFunctions.mockImplementation(() => functions)
    lambda.register.mockImplementation(() => BbPromise.resolve())

    const instance = new Simulate(serverless, options)

    return instance.register().then(() => {
      expect(lambda.register.mock.calls.length).toBe(1)
      expect(lambda.register.mock.calls[0][0]).toBe(options['lambda-port'])
      expect(lambda.register.mock.calls[0][1]).toBe(functions)
    })
  })
})
