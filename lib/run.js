'use strict'

const BbPromise = require('bluebird')
const config = require('./config')
const lambda = require('./invoke/local')()

function getEvent() {
  return this.options.path
    ? this.serverless.utils.readFileSync(this.options.path)
    : null
}

function run() {
  const functionName = this.options.function

  this.serverless.cli.log(`Run function ${functionName}...`)

  const func = config.getFunctionConfig(this.serverless, functionName)

  if (!func) {
    return BbPromise.reject(new Error(`Function ${functionName} does not exist`))
  }

  const event = this.getEvent()

  return lambda.invoke(
    func,
    event,
    (msg) => this.serverless.cli.log(msg)
  )
}

module.exports = {
  getEvent,
  run,
}
