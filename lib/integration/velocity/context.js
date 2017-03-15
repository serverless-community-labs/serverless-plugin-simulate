
'use strict'

const createInput = require('./context/input')
const createUtil = require('./context/util')
const escape = require('./context/escape')

const createHeaders = (req) => {
  const headers = {}
  // Capitilise headers
  Object.keys(req.headers || {}).forEach(key => {
    headers[key.replace(/((?:^|-)[a-z])/g, x => x.toUpperCase())] = req.headers[key]
  })

  return headers
}

const createFromRequest = (req) => {
  const body = req.body || {}
  const authPrincipalId = req.user ?
    req.user.principalId : 'offlineContext_authorizer_principalId'
  const headers = createHeaders(req)

  return {
    context: {
      apiId: 'offlineContext_apiId',
      authorizer: {
        principalId: authPrincipalId,
      },
      httpMethod: req.method.toUpperCase(),
      stage: req.context.stage,
      requestId: `offlineContext_requestId_${Math.random().toString(10).slice(2)}`,
      identity: {
        cognitoIdentityPoolId: 'offlineContext_cognitoIdentityPoolId',
        accountId: 'offlineContext_accountId',
        cognitoIdentityId: 'offlineContext_cognitoIdentityId',
        caller: 'offlineContext_caller',
        apiKey: 'offlineContext_apiKey',
        sourceIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        cognitoAuthenticationProvider: 'offlineContext_cognitoAuthenticationProvider',
        cognitoAuthenticationType: 'offlineContext_cognitoAuthenticationType',
        userArn: 'offlineContext_userArn',
        userAgent: req.headers['user-agent'] || '',
        user: 'offlineContext_user',
      },
      resourceId: 'offlineContext_resourceId',
      resourcePath: req.url,
    },
    input: createInput(req, headers, body),
    stageVariables: {},
    util: createUtil(),
  }
}

const createFromResult = (req, result) => {
  const headers = createHeaders(req)

  return {
    context: {},
    input: createInput(req, headers, result || {}),
    stageVariables: {},
    util: createUtil(),
  }
}

module.exports = {
  escapeJavaScript: escape.escapeJavaScript,
  createFromRequest,
  createFromResult,
}
