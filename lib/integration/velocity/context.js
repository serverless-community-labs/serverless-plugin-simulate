
'use strict'

const jp = require('jsonpath')
const jsEscapeString = require('js-string-escape')
const isPlainObject = require('lodash.isplainobject')

const escapeJavaScript = (x) => {
  if (typeof x === 'string') {
    return jsEscapeString(x).replace(/\\n/g, '\n')
  } else if (isPlainObject(x)) {
    const result = {}

    Object.keys(x).forEach((key) => {
      result[key] = jsEscapeString(x[key])
    })

    return JSON.stringify(result)
  } else if (typeof x.toString === 'function') {
    return escapeJavaScript(x.toString())
  }

  return x
}

const createFromRequest = (req) => {
  const body = req.body || {}
  const path = x => {
    const result = jp.query(body, x)
    return result[0]
  }
  const authPrincipalId = req.context.authorizer ?
    req.context.authorizer.principalId : 'offlineContext_authorizer_principalId'

  const headers = {}
  // Capitilise headers
  Object.keys(req.headers).forEach(key => {
    headers[key.replace(/((?:^|-)[a-z])/g, x => x.toUpperCase())] = req.headers[key]
  })

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
    input: {
      body: JSON.stringify(body), // Not a string yet, todo
      json: pathExp => JSON.stringify(path(pathExp)),
      params: param => {
        if (typeof param === 'string') {
          return req.params[param] || req.query[param] || headers[param]
        }

        return {
          path: Object.assign({}, req.params),
          querystring: Object.assign({}, req.query),
          header: headers,
        }
      },
      path,
    },
    stageVariables: req.context.stageVariables || {},
    util: {
      escapeJavaScript,
      urlEncode: encodeURI,
      urlDecode: decodeURI,
      base64Encode: x => new Buffer(x.toString(), 'binary').toString('base64'),
      base64Decode: x => new Buffer(x.toString(), 'base64').toString('binary'),
      parseJson: JSON.parse,
    },
  }
}

module.exports = {
  escapeJavaScript,
  createFromRequest,
}
