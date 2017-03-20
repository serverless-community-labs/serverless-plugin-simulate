'use strict'

const velocityContext = require('./velocity/context')
const velocityRenderer = require('./velocity/renderer')

const event = (req) => {
  const http = req.context.http
  const contentTypeString = req.get('Content-Type') || req.get('Accept') || '*/*'

  const contentTypes = contentTypeString.split(',')

  let template = null

  for (let i = 0; i < contentTypes.length; i++) {
    template = http.requestTemplates[contentTypes[i].replace(' ', '')]
    if (template) {
      break
    }
  }

  if (!template) throw new Error('No veolicty template is set')

  const context = velocityContext.createFromRequest(req)

  const result = velocityRenderer.render(template, context)

  const evt = JSON.parse(result)

  return evt
}

const getErrorString = (err) => {
  if (!err) {
    return ''
  } else if (err instanceof String) {
    return err
  } else if (err instanceof Error) {
    return err.message
  }

  return err.toString()
}

const selectResponseMapping = (req, err) => {
  const http = req.context.http
  const mappings = http.responseMappings || []

  const defaultMapping = mappings[0] || {
    statusCode: 200,
    pattern: '',
    template: '',
    parameters: {},
    headers: {},
  }

  if (!err) return defaultMapping

  const filteredMappings = mappings.filter((m) =>
    m.pattern && err.match(m.pattern)
  )

  const errorMapping = filteredMappings[0]
  return errorMapping || defaultMapping
}

const createMappedResponse = (req, mapping, result) => {
  const context = velocityContext.createFromResult(req, result)

  const body = mapping.template ?
    velocityRenderer.render(mapping.template, context) :
    result

  const resp = {
    statusCode: mapping.statusCode,
    headers: mapping.headers,
    body,
  }
  return Object.assign({}, resp)
}

const response = (req, result) => {
  const mapping = selectResponseMapping(req, null)
  return createMappedResponse(req, mapping, result)
}

const error = (req, err) => {
  const errorString = getErrorString(err)
  const mapping = selectResponseMapping(req, errorString)
  return createMappedResponse(req, mapping, {
    errorMessage: errorString,
  })
}

module.exports = {
  event,
  response,
  error,
}
