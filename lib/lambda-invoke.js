'use strict'

const BbPromise = require('bluebird')
const lambda = require('docker-lambda')

const noOp = () => (undefined)

const invoke = (func, event, logger) => {
  const log = logger || noOp
  log(`Invoking function ${func.handler} with memory ${func.memorySize}`)


  const memorySize = func.memorySize || 1024

  const dockerImage = func.runtime ? `lambci/lambda:${func.runtime}` : 'lambci/lambda'
  const dockerArgs = [
    '-m', `${memorySize}M`,
  ]

  const env = Object.assign(
    {},
    func.environment || {},
    {
      AWS_LAMBDA_FUNCTION_MEMORY_SIZE: memorySize,
      AWS_LAMBDA_FUNCTION_TIMEOUT: func.timeout || 6,
      AWS_REGION: func.region,
      SERVERLESS_SIMULATE: true,
    }
  )

  Object.keys(env).forEach((key) => {
    const value = env[key]

    dockerArgs.push('-e')
    dockerArgs.push(`${key}=${value}`)
  })

  const result = lambda({
    handler: func.handler,
    event,
    addEnvVars: true,
    dockerImage,
    dockerArgs,
    taskDir: func.servicePath,
    cleanUp: true,
    returnSpawnResult: true,
  })

  log(result.stderr)

  try {
    log('Parsing result')

    const output = result.stdout ? JSON.parse(result.stdout) : null

    if (!output) {
      return BbPromise.reject(new Error('Error executing function'))
    }

    if (output.errorMessage) {
      return BbPromise.reject(new Error(output.errorMessage))
    }

    return BbPromise.resolve(output)
  } catch (err) {
    log(err)

    return BbPromise.reject(new Error('Error executing function'))
  }
}

module.exports = {
  invoke,
}
