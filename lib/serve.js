'use strict'

const BbPromise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const authorizer = require('./authorizer/middleware')
const integration = require('./integration/middleware')

const OPTIONS = 'OPTIONS'

const noOp = () => (undefined)

const messageTemplate = (endpoint) => {
  const http = endpoint.http

  const method = `[${http.method.toUpperCase()} ${http.path}]`
  const authorizerName = http.authorizer
    ? ` => λ:${http.authorizer.name}`
    : ''

  const functionName = ` => λ:${endpoint.functionName}`
  return `${method}${authorizerName}${functionName}`
}

const configureLogger = (logger) => (req, res, next) => {
  req.logger = logger // eslint-disable-line no-param-reassign
  next()
}

const createContext = (endpoints) => (req, res, next) => {
  const endpoint = endpoints
    .filter(e =>
      e.http.method.toUpperCase() === req.method ||
      (e.http.cors && req.method === OPTIONS)
    )
    .find(e => e.http.path === req.url)

  if (!endpoint) {
    // this is what API Gateway does
    req.logger('HTTP Event Not Found: Try checking your serverless.yml')
    res.status(403)
    res.json({ message: 'Forbidden' })
    res.send()
    return
  }

  req.context = endpoint // eslint-disable-line no-param-reassign

  next()
}

const start = (endpoints, port, logger) => {
  const log = logger || noOp

  const server = express()

  server.use(configureLogger(log))
  server.use(morgan('dev'))
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use(createContext(endpoints))

  server.use(authorizer())

  endpoints.forEach(endpoint => {
    log(messageTemplate(endpoint))

    const http = endpoint.http

    const middleware = []

    if (http.cors) {
      const corsConfig = http.cors
      // eslint-disable-next-line max-len
      log(`[OPTIONS ${http.path}] => CORS origin: ${corsConfig.origins} methods: ${corsConfig.methods}`)

      const corsOptions = {
        origin: corsConfig.origins.length === 1 ? corsConfig.origins[0] : corsConfig.origins,
        methods: corsConfig.methods,
        credentials: corsConfig.allowCredentials || undefined,
        allowedHeaders: corsConfig.headers,
        optionsSuccessStatus: 200,
      }

      middleware.push(cors(corsOptions))

      server.options(http.path, cors(corsOptions))
    }

    server[http.method.toLowerCase()](http.path, middleware, integration())
  })

  return BbPromise.fromCallback(callback => server.listen(port, callback))
}

module.exports = {
  start,
}
