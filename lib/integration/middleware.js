'use strict'

const BbPromise = require('bluebird')

const integration = require('./index')

const respond = (res, response, onComplete) => {
  res.set(response.headers || {})
  res.status(response.statusCode)

  if (response.body) {
    res.send(response.body)
  } else {
    res.send()
  }

  if (onComplete) {
    onComplete()
  }

  return BbPromise.resolve()
}

module.exports = (lambda, onComplete) => (req, res) => {
  integration.event(req)
    .then(event => {
      const context = req.context

      req.logger(`Invoking ${context.functionName}`)

      return lambda.invoke(context, event, req.logger)
    })
    .then(result => integration.response(req, result))
    .catch(err => integration.error(req, err))
    .then(response => respond(res, response, onComplete))
    .catch(err => { // in case integration.error fails
      req.logger(`Error returning error response for ${req.path}`)
      req.logger(err)
      req.logger(err.stack)

      const response = {
        statusCode: 500,
        body: {
          errorMessage: `SIMULATE ERROR: ${err.message}`,
          stack: err.stack,
        },
      }
      return respond(res, response, onComplete)
    })
}
