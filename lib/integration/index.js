'use strict'

const BbPromise = require('bluebird')

const integrations = {
  'lambda': require('./lambda'),             // eslint-disable-line global-require, quote-props
  'lambda-proxy': require('./lambda-proxy'), // eslint-disable-line global-require
}

const getIntegration = (req) => {
  const http = req.context.http
  const type = http.integration.toLowerCase()

  const integration = integrations[type]

  if (!integration) {
    return BbPromise.reject(new Error(`Invalid integration type ${type}`))
  }

  return BbPromise.resolve(integration)
}

const event = (req) => {
  req.logger('Creating event')

  return getIntegration(req).then(integration => integration.event(req))
}

const response = (req, result) => {
  req.logger('Mapping response')

  return getIntegration(req).then(integration => integration.response(req, result))
}

const error = (req, err) => {
  req.logger('Creating error response')
  return getIntegration(req).then(integration => integration.error(req, err))
}

module.exports = {
  event,
  response,
  error,
}
