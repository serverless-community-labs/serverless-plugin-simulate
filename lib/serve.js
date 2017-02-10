'use strict'

const BbPromise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const authorizer = require('./authorizer')
const lambda = require('./lambda-invoke')
const integration = require('./integration')
const config = require('./config')

const OPTIONS = 'OPTIONS'

const noOp = () => (undefined)

const start = (endpoints, port, logger) => {
  const log = logger || noOp

  const server = express()

  server.use((req, res, next) => {
    req.logger = log // eslint-disable-line no-param-reassign
    next()
  })
  server.use(morgan('dev'))
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use((req, res, next) => {
    const endpoint = endpoints
      .filter(e => e.method.toUpperCase() === req.method || (e.cors && req.method === OPTIONS))
      .find(e => e.path === req.url)

    if (!endpoint) {
      // this is what API Gateway does
      res.status(403)
      res.json({ message: 'Forbidden' })
      res.send()
      return
    }

    req.context = endpoint // eslint-disable-line no-param-reassign

    next()
  })

  server.use((req, res, next) => {
    if (!req.context.authorizer || (req.context.cors && req.method === OPTIONS)) {
      next()
      return
    }

    const identitySource = req.context.authorizer.identitySource
    const identitySourceMatch = /^method.request.header.(\w+)$/.exec(identitySource)
    if (!identitySourceMatch || identitySourceMatch.length !== 2) {
      throw new Error(`only supports retrieving tokens from the headers (λ: ${authorizer})`)
    }

    const identityHeader = identitySourceMatch[1].toLowerCase()
    const token = req.get(identityHeader)

    authorizer.authorize(req.context, token, req.logger)
      .then(result => {
        req.context.authorizer = Object.assign( // eslint-disable-line no-param-reassign
          {},
          req.context.authorizer,
          result
        )
        next()
        return BbPromise.resolve()
      })
      .catch((err) => {
        log(`Error with authorizer: ${req.context.authorizer.name}`)
        log(err)

        res.status(404)
        res.send('Unauthorized')
      })
  })

  const messageTemplate = (endpoint) => {
    const method = `[${endpoint.method.toUpperCase()} ${endpoint.path}]`
    const authorizerName = (endpoint.authorizer)
      ? ` => λ:${endpoint.authorizer.name}`
      : ''
    const functionName = ` => λ:${endpoint.functionName}`
    return `${method}${authorizerName}${functionName}`
  }

  endpoints.forEach(endpoint => {
    log(messageTemplate(endpoint))

    const middleware = []

    if (endpoint.cors) {
      const corsConfig = config.getCorsConfig(endpoint.method, endpoint.cors)

      // eslint-disable-next-line max-len
      log(`[OPTIONS ${endpoint.path}] => CORS origin: ${corsConfig.origins} methods: ${corsConfig.methods}`)

      const corsOptions = {
        origin: corsConfig.origins.length === 1 ? corsConfig.origins[0] : corsConfig.origins,
        methods: corsConfig.methods,
        credentials: corsConfig.allowCredentials || undefined,
        allowedHeaders: corsConfig.headers,
        optionsSuccessStatus: 200,
      }

      middleware.push(cors(corsOptions))

      server.options(endpoint.path, cors(corsOptions))
    }

    server[endpoint.method.toLowerCase()](endpoint.path, middleware, (req, res) => {
      integration.event(req)
        .then(event => {
          const context = req.context
          return lambda.invoke(
            context.functionsPath,
            context.handler,
            context.memorySize,
            event,
            context.environment,
            req.logger
          )
        })
        .then(result => integration.response(req, result))
        .then(response => {
          res.status(response.statusCode)
          res.set(response.headers || {})
          if (response.body) {
            res.send(JSON.parse(response.body))
          }
          res.send()
          return BbPromise.resolve()
        })
        .catch(() => {
          res.status(400)
          res.send()
        })
    })
  })

  return BbPromise.fromCallback(callback => server.listen(port, callback))
}

module.exports = {
  start,
}
