'use strict'

const BbPromise = require('bluebird')
const authorizer = require('./index')

const OPTIONS = 'OPTIONS'

const getPathAuth = (methodArn, allowed) => {
  if (!methodArn) {
    throw new Error('methodArn argument is null')
  }

  const tmp = methodArn.split(':')
  const apiGatewayArnTmp = tmp[6].split('/')
  const pathParts = apiGatewayArnTmp.slice(3)
  const pathRegex = pathParts.reduce((regex, part) =>
    `${regex}/${part.replace('*', '(.*)')}`, ''
  )

  return {
    method: apiGatewayArnTmp[2],
    path: pathParts.join('/'),
    regex: new RegExp(pathRegex),
    allowed,
  }
}

const toUpper = str => {
  if (!str) return null

  return str.toUpperCase()
}

const isStringEqual = (a, b) => toUpper(a) === toUpper(b)

const isAuthorized = (method, path, result, log) => {
  if (!result.principalId) {
    log('Malformed Authorizer Result: No principalId supplied')
    return false
  }

  if (!result.policyDocument) {
    log('Malformed Authorizer Result: No policyDocument supplied')
    return false
  }

  const statements = result.policyDocument.Statement
  const byResource = statements.reduce((accum, statement) => {
    const includesInvokeApi = statement.Action &&
      statement.Action.indexOf('execute-api:Invoke') !== -1

    const allowed = statement.Effect === 'Allow' && includesInvokeApi

    if (statement.Resource) {
      statement.Resource.forEach((resource) => {
        if (accum[resource] !== undefined) {
          throw new Error(`Duplicate resource found in policyDocument ${resource}`)
        }

        accum.push(getPathAuth(resource, allowed)) // eslint-disable-line no-param-reassign
      })
    }

    return accum
  }, [])

  const matches = byResource.reduce((accum, resource) => {
    if (resource.method !== '*' && !isStringEqual(resource.method, method)) {
      return accum
    }

    const match = resource.regex.exec(path)

    if (match) {
      accum.push({
        matches: match.length,
        allowed: resource.allowed,
      })
    }

    return accum
  }, [])
  .sort((a, b) => a.matches < b.matches)

  return matches.length ? matches[0].allowed : false
}

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

      if (!isAuthorized(req.method, req.path, result, req.logger)) {
        req.logger(`Request is not authorized  ${req.method} ${req.path}`)
        res.status(401)
        res.send('Unauthorized')
        return BbPromise.resolve()
      }

      req.user = { // eslint-disable-line no-param-reassign
        principalId: result.principalId,
      }

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
