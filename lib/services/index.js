const spawnSync = require('child_process').spawnSync

const up = options => {
  const opts = options || {}
  const file = opts.file || `${process.cwd()}/docker-compose.yml`
  const host = opts.host
  const spawnOptions = opts.spawnOptions || { encoding: 'utf8' }

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

  return spawnResult.stderr.trim()
}

const start = (options, log) => {
  log('Starting mock services.')
  log(up(options, log))
  log('Started mock services.')
}

// Will spawn `docker-compose up -d` synchronously
module.exports = {
  start,
}
