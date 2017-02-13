'use strict'

const BbPromise = require('bluebird')
const ip = require('ip')
const rp = require('request-promise')

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const lambdaLocal = require('./invoke/local')

const data = require('./registry/data')
const registry = require('./registry/registry')
const invoke = require('./registry/invoke')

const PUT_FUNCTIONS_PATH = '/functions'
const noOp = () => (undefined)

const configureLogger = (logger) => (req, res, next) => {
  req.logger = logger // eslint-disable-line no-param-reassign
  next()
}

const register = (lambdaPort, functions, log) => {
  const uri = `http://localhost:${lambdaPort}${PUT_FUNCTIONS_PATH}`

  log(`Registering ${functions.length} functions with ${uri}`)

  return rp({
    method: 'PUT',
    uri,
    body: {
      functions,
    },
    json: true,
  })
}

const start = (port, dbPath, logger) => {
  const log = logger || noOp

  log(`Starting registry with db at ${dbPath}`)

  const db = data.createDb(dbPath)

  const server = express()

  server.use(configureLogger(log))
  server.use(morgan('dev'))
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))


  const endpoint = `http://${ip.address()}:${port}`

  const lambda = lambdaLocal(endpoint)

  server.put(PUT_FUNCTIONS_PATH, (req, res) => registry.putFunctions(db, req, res))

  server.post('/2015-03-31/functions/:functionName/invocations', (req, res) =>
    invoke.invoke20150331(lambda, db, req, res)
  )

  log(`Starting registry at: ${endpoint}`)

  return BbPromise.fromCallback(callback => server.listen(port, callback))
}

module.exports = {
  register,
  start,
}
