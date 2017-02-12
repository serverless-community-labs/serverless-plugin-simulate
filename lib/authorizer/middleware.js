'use strict'

const BbPromise = require('bluebird')
const authorizer = require('./index')

const OPTIONS = 'OPTIONS'

module.exports = (lambda) => (req, res, next) => {
  const endpoint = req.context
  const http = req.context.http

  if (!http.authorizer || (http.cors && req.method === OPTIONS)) {
    next()
    return BbPromise.resolve()
  }

  const identitySource = http.authorizer.identitySource
  const identitySourceMatch = /^method.request.header.(\w+)$/.exec(identitySource)
  if (!identitySourceMatch || identitySourceMatch.length !== 2) {
    throw new Error(`only supports retrieving tokens from the headers (λ: ${authorizer})`)
  }

  const identityHeader = identitySourceMatch[1].toLowerCase()
  const token = req.get(identityHeader)

  return authorizer.authorize(lambda, endpoint, token, req.logger)
    .then(result => {
      req.logger(`Authorization result for ${req.method} ${req.path}`)
      req.logger(JSON.stringify(result))
      next()
      return BbPromise.resolve()
    })
    .catch((err) => {
      req.logger(`Error with authorizer: ${http.authorizer.name}`)
      req.logger(err)

      res.status(404)
      res.send('Unauthorized')
    })
}
