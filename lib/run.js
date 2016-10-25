'use strict'

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
  const handler = this.serverless.service.getFunction(functionName).handler
  const event = this.getEvent()

  return lambda.invoke(servicePath, handler, event)
}

module.exports = {
  getEvent,
  run,
}
