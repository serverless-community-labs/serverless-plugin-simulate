'use strict'

const BbPromise = require('bluebird')

const integrations = {
  lambda: require('./lambda'),               // eslint-disable-line global-require
  'lambda-proxy': require('./lambda-proxy'), // eslint-disable-line global-require
}

const event = (req) => {
  const integration = integrations[req.context.integration.toLowerCase()]
  return BbPromise.resolve(integration.event(req))
}

const response = (req, result) => {
  const integration = integrations[req.context.integration.toLowerCase()]
  return BbPromise.resolve(integration.response(req, result))
}

module.exports = {
  event,
  response,
}
