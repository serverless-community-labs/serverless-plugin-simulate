'use strict'

const BbPromise = require('bluebird')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const router = require('./router')

const lambdaLocal = require('./invoke/local')
const lambdaRemote = require('./invoke/remote')

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

const createContext = (endpoints, corsMethodsForPath) => (req, res, next) => {
  const endpoint = router.getEndpoint(endpoints, req)

  if (!endpoint) {
    // this is what API Gateway does
    const errorMessage = 'HTTP Event Not Found: Try checking your serverless.yml'
    req.logger(errorMessage)
    res.status(403)
    res.json({ message: 'Forbidden' })
    res.send()
    next(errorMessage)
  }

  // Switch out the allowed methods for a precalculated array for all endpoints with that path
  if (req.method === OPTIONS && endpoint.http.cors && endpoint.http.path) {
    req.context = Object.assign({}, endpoints, { // eslint-disable-line no-param-reassign
      http: {
        cors: {
          methods: corsMethodsForPath[endpoint.http.path],
        },
      },
    })
  } else {
    req.context = endpoint // eslint-disable-line no-param-reassign
  }

  return next()
}

const start = (endpoints, corsMethodsForPath, port, lambdaPort, logger) => {
  const log = logger || noOp
  // When simulating API Gateway use remove lambda if available otherwise local
  const lambda = lambdaPort ? lambdaRemote(`http://localhost:${lambdaPort}`) : lambdaLocal()

  const server = express()

  server.use(configureLogger(log))
  server.use(morgan('dev'))
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.text({type: "text/*"}))
  
  server.use(createContext(endpoints, corsMethodsForPath))

  server.use(authorizer(lambda))

  endpoints.forEach(endpoint => {
    log(messageTemplate(endpoint))

    const http = endpoint.http

    const middleware = []

    if (http.cors) {
      const corsConfig = http.cors
      // eslint-disable-next-line max-len
      log(`[OPTIONS ${http.path}] => CORS origin: ${corsConfig.origins} methods: ${corsMethodsForPath[http.path]}`)

      const corsOptions = {
        origin: corsConfig.origins.length === 1 ? corsConfig.origins[0] : corsConfig.origins,
        methods: corsMethodsForPath[http.path],
        credentials: corsConfig.allowCredentials || undefined,
        allowedHeaders: corsConfig.headers,
        optionsSuccessStatus: 200,
      }

      middleware.push(cors(corsOptions))

      server.options(http.path, cors(corsOptions))
    }

    const httpMethod = http.method.toLowerCase()
    const expressMethod = httpMethod === 'any' ? 'all' : httpMethod

    const expressPath = router.toExpressPath(http.path)

    server[expressMethod](expressPath, middleware, integration(lambda))
  })

  log(`Invoke URL: http://localhost:${port}`)

  return BbPromise.fromCallback(callback => server.listen(port, callback))
}

module.exports = {
  start,
  createContext, // For unit testing purposes
}
