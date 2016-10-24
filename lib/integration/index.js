const BbPromise = require('bluebird')

const integrations = {
  'lambda': require('./lambda'),
  'lambda-proxy': require('./lambda-proxy'),
} 

const event = (req) => {
  const integration = integrations[req.context.integration.toLowerCase()]
  const event = integration.event(req)
  return BbPromise.resolve(event)
} 

const response = (req, result) => {
  const integration = integrations[req.context.integration.toLowerCase()]
  const response = integration.response(req, result)
  return BbPromise.resolve(response)
}

module.exports = {
  event,
  response,
}
