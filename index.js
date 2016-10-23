'use strict'

const path = require('path')
const BbPromise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')

const serverless = require('./src/serverless')
const authorizer = require('./src/authorizer')
const lambda = require('./src/lambda-invoke')
const integration = require('./src/integration')

const server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

const options = {
  region: 'us-east-1',
  stage: 'dev',
  path: path.join(process.cwd(), 'functions'),
  functions: {
    authorizer: {
      type: 'custom',
      handler: 'authorizer.index',
    },
    getAll: {
      handler: 'index.handler',
      events: [{
        type: 'http',
        method: 'GET',
        cors: true,
        authorizer: 'authorizer',
      }],
    },
  },
}

// serverless middleware to setup lambda context
server.use((req, res, next) => 
  serverless.fetch(options, req)
    .then(context => {
      req.context = context
      next()
      return BbPromise.resolve()
    })
    .catch(err => {
      console.log(err.stack)
    })
  )

// api gateway authorization 
// - custom authorizer
server.use((req, res, next) => { 
  if (!req.context.authorizer) 
    next()

  const token = req.get(req.context.authorizer.identitySource)
  authorizer.authorize(req.context, token)
    .then(result => {
      req.context.authorizer = Object.assign({}, req.context.authorizer, result)
      next()
      return BbPromise.resolve()
    })
    .catch(err => {
      res.status(404)
      res.send('Unauthorized')
    })
})

server.get("/", (req, res) => {
  integration.event(req)
    .then(event => lambda.invoke(req.context.path, req.context.handler, event))
    .then(result => integration.response(req, result))
    .then(response => {
      res.status(response.statusCode)
      res.set(response.headers || {})  
      if (response.body) 
        res.send(JSON.parse(response.body))
      res.send()
      return BbPromise.resolve()
    })
    .catch(response => {
      res.status(400)
      res.send()
    })
})

server.listen('4000', () => {
  console.log('http://localhost:4000')
})
