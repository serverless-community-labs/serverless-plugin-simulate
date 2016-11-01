/* eslint-disable */

'use strict'

const velocityContext = require('./velocity/context')
const velocityRenderer = require('./velocity/renderer')

const event = (req) => {
  console.log('creating request', req)

  const template = req.context.requestTemplate;

  if(!template) throw new Error('No veolicty template is set')

  const context = velocityContext.createFromRequest(req)

  console.log('Rendering template with context', context)

  const result = velocityRenderer.render(template, context)
  const event = JSON.parse(result)

  console.log('returning event', event)

  return event
}

const response = (req, result) => {
  console.log('Returning result', result)
  const resp = {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(result)
  }
  return Object.assign({}, resp)
}

module.exports = {
  event,
  response,
}
