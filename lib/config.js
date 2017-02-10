'use strict'

const getFunctionRuntime = (service, func) => func.runtime || service.provider.runtime

const getFunctionEnvironment = (service, func) => Object.assign(
  {},
  service.provider.environment || {},
  func.environment || {}
)

const getEndpoints = (service) => {
  const functions = service.getAllFunctions().map(name => {
    const obj = service.getFunction(name)
    return Object.assign({}, obj, { name }, { functionName: obj.name })
  })

  return functions.reduce((prev, next) => {
    const events = next.events.filter(event => 'http' in event).map(event => {
      const func = service.getFunction(next.name)
      const endpoint = {
        region: service.defaults.region,
        stage: service.defaults.stage,
        functionPath: service.serverless.config.servicePath,
        functionName: next.name,
      }

      const context = Object.assign(
        {},
        endpoint,
        event.http,
        func
      )
      delete context.events

      context.runtime = getFunctionRuntime(service, func)
      context.environment = getFunctionEnvironment(service, func)
      context.integration = context.integration || 'lambda-proxy'

      if (typeof context.authorizer === 'object') {
        context.authorizer = Object.assign(
          {},
          service.getFunction(context.authorizer.name),
          context.authorizer
        )
        delete context.authorizer.events
      }

      if (typeof context.authorizer === 'string' && context.authorizer.trim().length > 0) {
        const name = context.authorizer
        context.authorizer = service.getFunction(context.authorizer)
        context.authorizer.name = name

        delete context.authorizer.events
      }

      if (context.authorizer && !context.authorizer.identitySource) {
        context.authorizer.identitySource = 'method.request.header.Authorization'
      }

      return context
    })

    return prev.concat(events.map(event => Object.assign({}, event, { path: `/${event.path}` })))
  }, [])
}


const getDefaultConfig = (method) => {
  const headers = [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
  ]

  const cors = {
    origins: ['*'],
    methods: ['OPTIONS'],
    headers,
    allowCredentials: false,
  }

  cors.methods.push(method.toUpperCase())

  return cors
}

const getConfigFromSettings = (method, corsOptions) => {
  const cors = {
    origins: corsOptions.origins || ['*'],
    methods: corsOptions.methods || [],
    allowCredentials: Boolean(corsOptions.allowCredentials),
  }

  if (corsOptions.headers) {
    if (!Array.isArray(corsOptions.headers)) {
      throw new Error('CORS header values must be provided as an array.')
    }

    cors.headers = corsOptions.headers
  }

  if (cors.methods.indexOf('OPTIONS') === -1) {
    cors.methods.push('OPTIONS')
  }

  if (cors.methods.indexOf(method.toUpperCase()) === -1) {
    cors.methods.push(method.toUpperCase())
  }

  return cors
}

const getCorsConfig = (method, cors) => (
  typeof cors === 'object' ? getConfigFromSettings(method, cors) : getDefaultConfig(method)
)

module.exports = {
  getFunctionRuntime,
  getFunctionEnvironment,
  getEndpoints,
  getCorsConfig,
}
