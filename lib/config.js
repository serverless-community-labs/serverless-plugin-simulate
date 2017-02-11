'use strict'

const velocityDefaults = require('./integration/velocity/defaults')

const JSON_CONTENT_TYPE = 'application/json'

const getFunctionConfig = (serverless, functionName, functionConfig) => {
  const servicePath = serverless.config.servicePath
  const provider = serverless.service.provider

  return Object.freeze({
    functionName,
    region: provider.region,
    stage: provider.stage,
    servicePath,
    handler: functionConfig.handler,
    memorySize: functionConfig.memorySize || provider.memorySize,
    timeout: functionConfig.timeout || provider.timeout,
    runtime: functionConfig.runtime || provider.runtime,
    environment: Object.assign(
      {},
      provider.environment || {},
      functionConfig.environment || {}
    ),
  })
}

const getAuthorizerName = (http) => {
  if (typeof http.authorizer === 'object') {
    return http.authorizer.name
  }

  if (typeof http.authorizer === 'string' && http.authorizer.trim().length > 0) {
    return http.authorizer
  }

  return null
}

// TODO: Support cross-service authorizers locally
const getAuthorizerConfig = (functions, http) => {
  const authorizerName = getAuthorizerName(http)
  if (!authorizerName) return null
  const identitySource = http.authorizer.identitySource || 'method.request.header.Authorization'

  const authorizerFunction = functions[authorizerName]

  if (!authorizerFunction) throw new Error(`Cannot find authorizer with name ${authorizerName}`)

  return Object.freeze({
    name: authorizerName,
    identitySource,
    function: authorizerFunction.config,
  })
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

  return Object.freeze(cors)
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

  return Object.freeze(cors)
}

const getCorsConfig = (method, cors) => {
  if (!cors) return null

  return typeof cors === 'object' ? getConfigFromSettings(method, cors) : getDefaultConfig(method)
}

const getHttpConfig = (functions, http) => {
  const authorizer = getAuthorizerConfig(functions, http)
  const cors = getCorsConfig(http.method, http.cors)

  const config = Object.assign(
    { integration: 'lambda-proxy' },
    http,
    {
      path: `/${http.path}`,
      authorizer,
      cors,
    }
  )

  if (config.integration === 'lambda') {
    const requestTemplateSettings = http.request ? http.request.template : {
      'application/json': velocityDefaults.JSON_REQUEST_TEMPLATE,
    }

    config.requestTemplates = Object.assign(
      {
        '*/*': requestTemplateSettings[JSON_CONTENT_TYPE],
      },
      requestTemplateSettings
    )

    if (http.response) {
      const statusCodes = Object.keys(http.response.statusCodes || {})

      // eslint-disable-next-line arrow-body-style
      const defaultStatusCode = statusCodes.reduce((statusCode, settings) => {
        return settings.pattern ? settings.statusCode : statusCode
      }, 200)

      const defaultResponse = {
        statusCode: defaultStatusCode,
        headers: http.response.headers,
        template: http.response.template,
        pattern: '',
      }

      config.responseMappings = statusCodes.reduce((accum, statusCode) => {
        const response = http.response.statusCodes[statusCode]

        if (statusCode.pattern) {
          accum.push({
            statusCode,
            headers: response.headers,
            template: response.template,
            pattern: response.pattern,
          })
        }

        return accum
      }, [defaultResponse])
    } else {
      config.responseMappings = velocityDefaults.RESPONSE_STATUS_CODE
    }
  }

  return Object.freeze(config)
}

const getFunctions = (serverless) => serverless.service.getAllFunctions().reduce((accum, name) => {
  const functionConfig = serverless.service.getFunction(name)

  accum[name] = { // eslint-disable-line no-param-reassign
    config: getFunctionConfig(serverless, name, functionConfig),
    events: functionConfig.events,
  }

  return accum
}, {})

const getFunction = (serverless, name) =>
  serverless.service.getAllFunctions().reduce((accum, funcName) => {
    if (name !== funcName) return accum

    const functionConfig = serverless.service.getFunction(name)

    return { // eslint-disable-line no-param-reassign
      config: getFunctionConfig(serverless, name, functionConfig),
      events: functionConfig.events,
    }
  }, null)

const getEndpoints = (serverless) => {
  const functions = getFunctions(serverless)

  return Object.keys(functions).reduce((accum, name) => {
    const func = functions[name]
    if (!func.events) return accum

    const events = func.events.filter(event => 'http' in event).map(event => {
      const http = getHttpConfig(functions, event.http)
      const config = Object.assign({}, func.config, { http })
      return Object.freeze(config)
    })

    return accum.concat(events)
  }, [])
}

module.exports = {
  getFunctionConfig: (serverless, functionName) => {
    const func = getFunction(serverless, functionName)
    if (!func) return null

    return getFunctionConfig(serverless, functionName, func.config)
  },
  getEndpoints,
}
