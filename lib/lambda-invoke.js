'use strict'

const BbPromise = require('bluebird')
const lambda = require('docker-lambda')

const LOCAL_ENV = {
  SERVERLESS_SIMULATE: true,
}

const noOp = () => (undefined)

const invoke = (runtime, path, handler, memoryLimit, event, environment, logger) => {
  const log = logger || noOp
  log(`Invoking function ${handler} with memory ${memoryLimit}`)

  const dockerImage = runtime ? `lambci/lambda:${runtime}` : 'lambci/lambda'
  const dockerArgs = [
    '-m', `${memoryLimit || 1024}M`,
  ]

  const env = Object.assign(
    {},
    environment || {},
    LOCAL_ENV
  )

  Object.keys(env).forEach((key) => {
    const value = env[key]

    dockerArgs.push('-e')
    dockerArgs.push(`${key}=${value}`)
  })

  const result = lambda({
    handler,
    event,
    addEnvVars: true,
    dockerImage,
    dockerArgs,
    taskDir: path,
    cleanUp: true,
    returnSpawnResult: true,
  })

  if (!result.stdout && result.stderr) {
    return BbPromise.reject(new Error(result.stderr))
  }

  // This is where the function output is shown
  log(result.stderr)

  const output = JSON.parse(result.stdout)

  if (output.errorMessage) {
    return BbPromise.reject(new Error(output.errorMessage))
  }

  return BbPromise.resolve(output)
}

module.exports = {
  invoke,
}
