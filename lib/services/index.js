'use strict'

const spawnSync = require('child_process').spawnSync
const fs = require('fs')

const start = (options, log) => {
  const opts = options || {}
  const file = opts.file || `${process.cwd()}/docker-compose.yml`
  const host = opts.host
  const spawnOptions = opts.spawnOptions || { encoding: 'utf8' }

  if (!fs.existsSync(file)) return

  log('Starting mock services.')

  const args = []
    .concat(file ? ['--file', file] : [])
    .concat(host ? ['--host', host] : [])
    .concat(['up', '-d'])

  const spawnResult = spawnSync('docker-compose', args, spawnOptions)

  if (spawnResult.error || spawnResult.status !== 0) {
    let err = spawnResult.error
    if (!err) {
      err = new Error(spawnResult.stdout || spawnResult.stderr)
      err.code = spawnResult.status
      err.stdout = spawnResult.stdout
      err.stderr = spawnResult.stderr
    }
    throw err
  }

  const stdout = spawnResult.stderr.trim()
  log(stdout)
}

// Will spawn `docker-compose up -d` synchronously
module.exports = {
  start,
}
