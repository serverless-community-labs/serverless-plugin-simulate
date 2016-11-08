/* eslint-disable */

'use strict'

const velocityContext = require('./velocity/context')
const velocityRenderer = require('./velocity/renderer')

const event = (req) => {
  console.log('creating request', req)

  const template = req.context.requestTemplate

  if(!template) throw new Error('No veolicty template is set')

  const context = velocityContext.createFromRequest(req)

  console.log('Rendering template with context', context)

  const result = velocityRenderer.render(template, context)
  const event = JSON.parse(result)

  console.log('returning event', event)

  return event
}

const getErrorString = (err) => {
  if (!err) {
    return ''
  } else if (err instanceof String) {
    return err
  } else if(err instanceof Error) {
    return err.message
  }

  return err.toString()
}

const selectResponseMapping = (req, err) => {
  const mappings = req.context.responseMappings || {}

  const defaultMapping = mappings[0] || {
    StatusCode: 200,
    SelectionPattern: '',
    ResponseParameters: {},
    ResponseTemplates: {},
  }

  if(!err) return defaultMapping

  const filteredMappings = mappings.filter((m) => {
    return m.SelectionPattern && err.match(m.SelectionPattern)
  });

  const errorMapping = filteredMappings[0]
  return errorMapping || defaultMapping
}

const createMappedResponse = (req, mapping, body) => {
  const resp = {
    statusCode: mapping.StatusCode,
    headers: {},
    body: JSON.stringify(body)
  }
  return Object.assign({}, resp)
}

const response = (req, result) => {
  console.log('Handling result', result)

  const mapping = selectResponseMapping(req, null)
  return createMappedResponse(req, mapping, result)
}

const error = (req, err) => {
  console.log('Handling error', err)

  const errorString = getErrorString(err)
  const mapping = selectResponseMapping(req, errorString)
  return createMappedResponse(req, mapping, {
    errorMessage: errorString
  })
}

module.exports = {
  event,
  response,
  error,
}
