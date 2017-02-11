'use strict'

const BbPromise = require('bluebird')

const integrations = {
  'lambda': require('./lambda'),             // eslint-disable-line global-require, quote-props
  'lambda-proxy': require('./lambda-proxy'), // eslint-disable-line global-require
}

const event = (req) => {
  const http = req.context.http
  const type = http.integration.toLowerCase()

  req.logger(`Creating event for ${type} integration`)

  const integration = integrations[type]
  return BbPromise.resolve(integration.event(req))
}

const response = (req, result) => {
  const http = req.context.http
  const type = http.integration.toLowerCase()

  req.logger(`Mapping response for ${type} integration`)

  const integration = integrations[type]
  return BbPromise.resolve(integration.response(req, result))
}

module.exports = {
  event,
  response,
}
