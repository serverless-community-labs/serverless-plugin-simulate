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
  const environment = config.getFunctionEnvironment(this.serverless.service, func)

  const event = this.getEvent()

  return lambda.invoke(
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
