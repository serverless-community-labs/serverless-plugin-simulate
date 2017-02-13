'use strict'

const BbPromise = require('bluebird')

const integration = require('./index')

const respond = (res, response) => {
  res.status(response.statusCode)
  res.set(response.headers || {})
  if (response.body) {
    res.send(response.body)
  }
  res.send()
  return BbPromise.resolve()
}

module.exports = (lambda) => (req, res) => {
  integration.event(req)
    .then(event => {
      const context = req.context

      req.logger(`Invoking ${context.functionName}`)

      return lambda.invoke(context, event, req.logger)
    })
    .then(result => integration.response(req, result))
    .then(response => respond(res, response))
    .catch((err) => integration
      .error(req, err)
      .then(response => respond(res, response))
      .catch((e) => { // in case integration.error fails
        req.logger(`Error returning error response for ${req.path}`)
        req.logger(e)
        req.logger(e.stack)

        respond(res, {
          statusCode: 500,
          body: {
            errorMessage: `SIMULATE ERROR: ${e.message}`,
            stack: e.stack,
          },
        })
      })
    )
}
