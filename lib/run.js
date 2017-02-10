'use strict'

const config = require('./config')
const lambda = require('./lambda-invoke')

function getEvent() {
  return this.options.path
    ? this.serverless.utils.readFileSync(this.options.path)
    : null
}

function run() {
  const functionName = this.options.function

  this.serverless.cli.log(`Run function ${functionName}...`)

  const servicePath = this.serverless.config.servicePath
  const func = this.serverless.service.getFunction(functionName)

  const runtime = config.getFunctionRuntime(this.serverless.service, func)
  const environment = config.getFunctionEnvironment(this.serverless.service, func)

  this.serverless.cli.log(`Func: ${JSON.stringify(func)}`)

  const event = this.getEvent()

  return lambda.invoke(
    runtime,
    servicePath,
    func.handler,
    func.memorySize,
    event,
    environment,
    (msg) => this.serverless.cli.log(msg)
  )
}

module.exports = {
  getEvent,
  run,
}
