'use strict'

const BbPromise = require('bluebird')

const lambda = require('../lambda-invoke')
const integration = require('./index')

module.exports = () => (req, res) => {
  integration.event(req)
    .then(event => {
      const context = req.context

      req.logger(`Invoking ${context.functionName}`)

      return lambda.invoke(context, event, req.logger)
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
    .catch((err) => {
      req.logger(`Error running integration for ${req.method} ${req.path}`)
      req.logger(err)

      res.status(400)
      res.send()
    })
}
