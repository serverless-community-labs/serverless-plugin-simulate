'use strict'

const BbPromise = require('bluebird')
const lambda = require('docker-lambda')

const invoke = (path, handler, event) => {
  const result = lambda({
    handler,
    event,
    taskDir: path,
    cleanUp: true,
    returnSpawnResult: true,
  })

  if (!result.stdout && result.stderr) {
    return BbPromise.reject(new Error(result.stderr))
  }

  const output = JSON.parse(result.stdout)

  if (output.errorMessage) {
    return BbPromise.reject(new Error(output.errorMessage))
  }

  return BbPromise.resolve(output)
}

module.exports = {
  invoke,
}
