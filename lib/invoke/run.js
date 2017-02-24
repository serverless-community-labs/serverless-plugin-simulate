'use strict'

const BbPromise = require('bluebird')
const spawn = require('child_process').spawn

const ENV_VARS = [
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
  'AWS_ACCOUNT_ID',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_LAMBDA_FUNCTION_NAME',
  'AWS_LAMBDA_FUNCTION_VERSION',
  'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
  'AWS_LAMBDA_FUNCTION_TIMEOUT',
  'AWS_LAMBDA_FUNCTION_HANDLER',
  'AWS_LAMBDA_EVENT_BODY',
]

const ENV_ARGS = ENV_VARS.reduce((accum, x) => accum.concat(['-e', x]), [])

const log = (msg) => console.log(msg) // eslint-disable-line no-console

// Will spawn `docker run` async and return stdout
module.exports = (opt) => {
  const options = opt || {}
  const dockerImage = options.dockerImage || 'lambci/lambda'
  const handler = options.handler || 'index.handler'
  const event = options.event || {}
  const taskDir = options.taskDir == null ? process.cwd() : options.taskDir
  const cleanUp = options.cleanUp == null ? true : options.cleanUp
  const addEnvVars = options.addEnvVars || false
  const dockerArgs = options.dockerArgs || []
  const spawnOptions = options.spawnOptions || { encoding: 'utf8' }

  const args = ['run']
    .concat(taskDir ? ['-v', `${taskDir}:/var/task`] : [])
    .concat(cleanUp ? ['--rm'] : [])
    .concat(addEnvVars ? ENV_ARGS : [])
    .concat(dockerArgs)
    .concat([dockerImage, handler, JSON.stringify(event)])

  const run = spawn('docker', args, spawnOptions)

  return new BbPromise((resolve, reject) => {
    let stdout = ''
    let stderr = ''

    run.stdout.on('data', (data) => {
      const str = data.toString()
      log(str.replace(/\n$/, ''))
      stdout += str
    })

    run.stderr.on('data', (data) => {
      const str = data.toString()
      log(str.replace(/\n$/, ''))
      stderr += str
    })

    run.on('close', (code) => {
      const result = {
        code,
        stdout,
        stderr,
      }

      if (code === 0) {
        resolve(result)
      } else {
        reject(result)
      }
    })
  })
}
