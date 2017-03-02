'use strict'

const toUpper = str => {
  if (!str) return null

  return str.toUpperCase()
}

const isStringEqual = (a, b) => toUpper(a) === toUpper(b)

const getPathAuth = (methodArn, allowed) => {
  if (!methodArn) {
    throw new Error('methodArn argument is null')
  }

  const tmp = methodArn.split(':')
  const apiGatewayArnTmp = tmp[5].split('/')
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

const isAuthorized = (method, path, result, log) => {
  log('Checking if request is authorized')

  if (!result.principalId) {
    log('Malformed Authorizer Result: No principalId supplied')
    return false
  }

  log(`Authorizer returned principalId: ${result.principalId}`)

  if (!result.policyDocument) {
    log('Malformed Authorizer Result: No policyDocument supplied')
    return false
  }

  const statements = result.policyDocument.Statement

  const byResource = statements.reduce((accum, statement) => {
    log(`Processing statement ${JSON.stringify(statement)}`)
    const includesInvokeApi = statement.Action &&
      statement.Action.indexOf('execute-api:Invoke') !== -1

    const allowed = statement.Effect === 'Allow' && includesInvokeApi
    const resource = statement.Resource

    if (Array.isArray(resource)) {
      log(`Checking resources ${JSON.stringify(resource)} for match`)
      resource.forEach((r) => {
        if (accum[r] !== undefined) {
          throw new Error(`Duplicate resource found in policyDocument ${r}`)
        }

        accum.push(getPathAuth(r, allowed, log)) // eslint-disable-line no-param-reassign
      })
    } else if (typeof resource === 'string') {
      log(`Checking resource ${resource} for match`)
      accum.push(getPathAuth(resource, allowed, log))
    }

    return accum
  }, [])

  log(`Finding a match for path ${path}`)

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

module.exports = {
  getPathAuth,
  isAuthorized,
}
