'use strict'

const BbPromise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')

const authorizer = require('./authorizer')
const lambda = require('./lambda-invoke')
const integration = require('./integration')

const parse = (service) => {
  const functions = service.getAllFunctions().map(name => {
    const obj = service.getFunction(name)
    return Object.assign({}, obj, { name }, { functionName: obj.name })
  })

  return functions.reduce((prev, next) => {
    const events = next.events.filter(event => 'http' in event).map(event => {
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
        service.getFunction(endpoint.functionName))
      delete context.events

      context.integration = context.integration || 'lambda-proxy'

      if (typeof context.authorizer === 'object') {
        context.authorizer = Object.assign(
          {},
          service.getFunction(context.authorizer.name),
          context.authorizer)
        delete context.authorizer.events
      }

      if (typeof context.authorizer === 'string' && context.authorizer.trim().length > 0) {
        const name = context.authorizer
        context.authorizer = service.getFunction(context.authorizer)
        context.authorizer.name = name
        delete context.authorizer.events
      }

      return context
    })

    return prev.concat(events.map(event => Object.assign({}, event, { path: `/${event.path}` })))
  }, [])
}

function serve() {
  this.serverless.cli.log(`Invoke URL: http://localhost:${this.options.port}`)

  const service = this.serverless.service
  const port = this.options.port
  const endpoints = parse(service)

  const server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use((req, res, next) => {
    const endpoint = endpoints
      .filter(e => e.method.toUpperCase() === req.method)
      .find(e => e.path === req.url)

    if (!endpoint) {
      return
    }

    req.context = endpoint // eslint-disable-line no-param-reassign

    next()
  })

  server.use((req, res, next) => {
    if (!req.context.authorizer) {
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
    authorizer.authorize(req.context, token)
      .then(result => {
        req.context.authorizer = Object.assign( // eslint-disable-line no-param-reassign
          {},
          req.context.authorizer,
          result)
        next()
        return BbPromise.resolve()
      })
      .catch(() => {
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
    this.serverless.cli.log(messageTemplate(endpoint))

    server[endpoint.method.toLowerCase()](endpoint.path, (req, res) => {
      integration.event(req)
        .then(event => lambda.invoke(req.context.functionsPath, req.context.handler, event))
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
  serve,
}
