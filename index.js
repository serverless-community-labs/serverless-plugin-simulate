'use strict'

const BbPromise = require('bluebird')
const path = require('path')

const run = require('./lib/run')
const config = require('./lib/config')
const lambda = require('./lib/lambda')
const serve = require('./lib/serve')
const services = require('./lib/services')

const apiGatewayConfig = {
  usage: 'Simulate the API Gateway and serves λ locally',
  lifecycleEvents: [
    'initialize',
    'start',
  ],
  options: {
    port: {
      usage: 'Port to listen on. Default: 3000',
      shortcut: 'p',
    },
    'lambda-port': {
      usage: 'Endpoint of a lambda simulation. Optional',
      shortcut: 'l',
    },
  },
}

class Simulate {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.simulateConfig = (serverless.service.custom ? serverless.service.custom.simulate : null) || {}
    this.dist = this.simulateConfig.dist ? `/${this.simulateConfig.dist}` : ''

    Object.assign(
      this,
      run
    )

    this.commands = {
      simulate: {
        usage: 'Simulate λ locally',
        lifecycleEvents: [
          'invoke',
        ],
        options: {
          path: {
            usage: 'Path to handlers directory',
            shortcut: 'i',
          },
        },
        commands: {
          services: {
            usage: 'Start supporting services',
            lifecycleEvents: [
              'start',
            ],
            options: {
              file: {
                usage: 'Specify an alternate compose file. Default: docker-compose.yml',
                shortcut: 'f',
              },
              host: {
                usage: 'Docker daemon socket to connect to.',
                shortcut: 'h',
              },
            },
          },
          invoke: {
            usage: 'Run a λ function locally',
            lifecycleEvents: [
              'invoke',
            ],
            options: {
              'dc-file': {
                usage: 'Name of the function',
                shortcut: 'f',
                required: true,
              },
              'dc-host': {
                usage: 'Path to JSON file holding input data',
                shortcut: 'p',
              },
            },
          },
          serve: apiGatewayConfig,
          apigateway: apiGatewayConfig,
          lambda: {
            usage: 'Simulate the λ API',
            lifecycleEvents: [
              'start',
            ],
            options: {
              port: {
                usage: 'Port to listen on. Default: 4000',
                shortcut: 'p',
              },
              'db-path': {
                usage: 'Path to store the functions database. Default: ./.simulate-lambda-db',
                shortcut: 'd',
              },
            },
          },
          register: {
            usage: 'Register functions with the λ API',
            lifecycleEvents: [
              'register',
            ],
            options: {
              'lambda-port': {
                usage: 'Endpoint of a lambda simulation. Optional',
                shortcut: 'l',
                required: true,
              },
            },
          },
        },
      },
    }

    this.hooks = {
      'simulate:invoke:invoke': () => BbPromise.bind(this)
        .then(this.servicesStart)
        .then(this.run)
        .then(out => this.serverless.cli.consoleLog(out)),

      'simulate:services:start': () => BbPromise.bind(this)
        .then(this.servicesStart),

      'simulate:register:register': () => BbPromise.bind(this)
        .then(this.register),

      'simulate:lambda:start': () => BbPromise.bind(this)
        .then(this.servicesStart)
        .then(this.lambda),

      'simulate:serve:initialize': () => BbPromise.bind(this)
        .then(this.apigatewayInit),

      'simulate:serve:start': () => BbPromise.bind(this)
        .then(this.servicesStart)
        .then(this.apigatewayStart),

      'simulate:apigateway:initialize': () => BbPromise.bind(this)
        .then(this.apigatewayInit),

      'simulate:apigateway:start': () => BbPromise.bind(this)
        .then(this.servicesStart)
        .then(this.apigatewayStart),
    }
  }

  servicesStart() {
    const file = this.options['dc-file']
    const host = this.options['dc-host']
    const options = config.getMockServices(this.serverless, file, host)
    const logger = this.createLogger()
    services.start(options, logger)
  }

  apigatewayInit() {
    const lambdaPort = this.options['lambda-port']

    if (!lambdaPort) return BbPromise.resolve()

    const functions = config.getFunctions(this.serverless)

    const logger = this.createLogger()
    return lambda.register(lambdaPort, functions, logger)
  }

  apigatewayStart() {
    const lambdaPort = this.options['lambda-port']
    const port = this.options.port || 3000

    const endpoints = config.getEndpoints(this.serverless)

    const logger = this.createLogger()
    return serve.start(endpoints.endpoints, endpoints.corsMethodsForPath, port, lambdaPort, logger)
  }

  lambda() {
    const defaultDbPath = path.join(this.serverless.config.servicePath, '.sls-simulate-registry')

    const port = this.options.port || 4000
    const dbPath = this.options['db-path'] || defaultDbPath

    const logger = this.createLogger()
    return lambda.start(port, dbPath, this.dist, logger)
  }

  register() {
    const functions = config.getFunctions(this.serverless)
    const lambdaPort = this.options['lambda-port']

    if (!lambdaPort) return BbPromise.reject(new Error('Lambda port is required'))

    const logger = this.createLogger()
    return lambda.register(lambdaPort, functions, logger)
  }

  createLogger() {
    return (msg) => {
      const isObject = msg === Object(msg)
      const message = isObject ? JSON.stringify(msg) : msg
      this.serverless.cli.log(message)
    }
  }
}

module.exports = Simulate
