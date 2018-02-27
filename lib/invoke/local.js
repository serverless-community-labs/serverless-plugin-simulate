'use strict'

const BbPromise = require('bluebird')
const fs = require('fs')
const { spawnSync } = require('child_process')
const run = require('./run')

const noOp = () => (undefined)

const invoke = (func, event, lambdaEndpoint, logger) => {
  const log = logger || noOp

  log(`Invoking function ${func.handler}`)

  const memorySize = func.memorySize || 1024

  const dockerImage = func.runtime ? `lambci/lambda:${func.runtime}` : 'lambci/lambda'

  let taskDir
  // If the service has an explicitly specified artifact - probably a fat JAR
  // for a Java project, we need to unpack it and make it available to the
  // container.
  if (func.artifact !== undefined) {
    const unzippedPath = `${func.servicePath}/.sls-simulate-unzipped`
    // Replicating mkdir -p unzippedPath
    try {
      fs.mkdirSync(unzippedPath)
    } catch (err) {
      if (!err.code === 'EEXIST') {
        throw err
      }
    }
    spawnSync('unzip', ['-uqo', func.artifact, '-d', unzippedPath])
    taskDir = unzippedPath
  } else {
    // If it doesn't have one, use the service directory.
    taskDir = func.servicePath
  }

  const dockerArgs = [
    '-m', `${memorySize}M`,
  ]

  const network = func.projectName ? `${func.projectName}_default` : ''
  if (network) {
    dockerArgs.push('--network')
    dockerArgs.push(network)
  } else {
    dockerArgs.push('--network')
    dockerArgs.push('host')
  }

  const simulateEnvironment = {
    AWS_LAMBDA_FUNCTION_NAME: func.key,
    AWS_LAMBDA_FUNCTION_MEMORY_SIZE: memorySize,
    AWS_LAMBDA_FUNCTION_TIMEOUT: func.timeout || 6,
    AWS_LAMBDA_LOG_GROUP_NAME: `/aws/lambda/${func.key}`,
    AWS_REGION: func.region,
    SERVERLESS_SIMULATE: true,
    SERVERLESS_SIMULATE_STAGE: func.stage,
  }

  if (lambdaEndpoint) {
    simulateEnvironment.SERVERLESS_SIMULATE_LAMBDA_ENDPOINT = lambdaEndpoint
  }

  const env = Object.assign(
    {},
    func.environment || {},
    simulateEnvironment
  )

  Object.keys(env).forEach((key) => {
    const value = env[key]

    dockerArgs.push('-e')
    dockerArgs.push(`${key}=${value}`)
  })

  return run({
    handler: func.handler,
    event,
    addEnvVars: true,
    dockerImage,
    dockerArgs,
    taskDir,
    cleanUp: true,
    returnSpawnResult: true,
  }).then((result) => {
    try {
      const output = result.stdout ? JSON.parse(result.stdout) : null

      if (output && output.errorMessage !== null && output.errorMessage !== undefined) {
        return BbPromise.reject(new Error(output.errorMessage))
      }

      return BbPromise.resolve(output)
    } catch (err) {
      log(err)

      return BbPromise.reject(new Error('Error executing function'))
    }
  })
}

module.exports = (lambdaEndpoint) => ({
  invoke: (func, event, logger) => invoke(func, event, lambdaEndpoint, logger),
})
