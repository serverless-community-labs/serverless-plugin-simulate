'use strict'

const BbPromise = require('bluebird')

const integrations = {
  'lambda': require('./lambda'),             // eslint-disable-line global-require, quote-props
  'lambda-proxy': require('./lambda-proxy'), // eslint-disable-line global-require
}

const event = (req) => {
  const type = req.context.integration.toLowerCase()
  const integration = integrations[type]
  return BbPromise.resolve(integration.event(req))
}

const response = (req, result) => {
  const type = req.context.integration.toLowerCase()
  const integration = integrations[type]
  return BbPromise.resolve(integration.response(req, result))
}

const error = (req, err) => {
  const type = req.context.integration.toLowerCase()
  const integration = integrations[type]
  return BbPromise.resolve(integration.error(req, err))
}

module.exports = {
  event,
  response,
  error,
}
