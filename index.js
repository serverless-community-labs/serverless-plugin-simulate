'use strict'

const BbPromise = require('bluebird')

const run = require('./lib/run')
const config = require('./lib/config')
const serve = require('./lib/serve')

class Simulate {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options

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
          invoke: {
            usage: 'Run a λ function locally',
            lifecycleEvents: [
              'invoke',
            ],
            options: {
              function: {
                usage: 'Name of the function',
                shortcut: 'f',
                required: true,
              },
              path: {
                usage: 'Path to JSON file holding input data',
                shortcut: 'p',
              },
            },
          },
          serve: {
            usage: 'Simulate the API Gateway and serves λ locally',
            lifecycleEvents: [
              'serve',
            ],
            options: {
              port: {
                usage: 'Port to listen on. Default: 3000',
                shortcut: 'p',
              },
            },
          },
        },
      },
    }

    this.hooks = {
      'simulate:invoke:invoke': () => BbPromise.bind(this)
        .then(this.run)
        .then(out => this.serverless.cli.consoleLog(out)),

      'simulate:serve:serve': () => BbPromise.bind(this)
         .then(this.serve),
    }
  }

  serve() {
    const log = (msg) => this.serverless.cli.log(msg)
    const port = this.options.port
    const endpoints = config.getEndpoints(this.serverless.service)

    this.serverless.cli.log(`Invoke URL: http://localhost:${port}`)

    return serve.start(endpoints, port, log)
  }
}

module.exports = Simulate
