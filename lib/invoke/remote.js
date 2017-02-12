'use strict'

const rp = require('request-promise')

const noOp = () => (undefined)

const invoke = (func, event, lambdaEndpoint, logger) => {
  const log = logger || noOp

  // eslint-disable-next-line max-len
  const uri = `${lambdaEndpoint.replace(/\/$/, '')}/2015-03-31/functions/${func.key}/invocations`

  log(`Invoking function at ${uri}`)

  return rp({
    method: 'POST',
    uri,
    headers: {
      'X-Amz-Invocation-Type': 'RequestResponse',
    },
    body: event || {},
    json: true,
  })
}

module.exports = (lambdaEndpoint) => ({
  invoke: (func, event, logger) => invoke(func, event, lambdaEndpoint, logger),
})
