'use strict'

const event = (req) => {
  const context = req.context

  const input = {
    path: req.url,
    headers: req.headers,
    pathParameters: req.params || {},
    requestContext: {
      accountId: 'localContext_accountId',
      resourceId: 'localContext_resourceId',
      stage: context.stage,
      requestId: `localContext_requestId_${Math.random().toString(10).slice(2)}`,
      identity: {
        cognitoIdentityPoolId: 'localContext_cognitoIdentityPoolId',
        accountId: 'localContext_accountId',
        cognitoIdentityId: 'localContext_cognitoIdentityId',
        caller: 'localContext_caller',
        apiKey: 'localContext_apiKey',
        sourceIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        cognitoAuthenticationType: 'localContext_cognitoAuthenticationType',
        cognitoAuthenticationProvider: 'localContext_cognitoAuthenticationProvider',
        userArn: 'localContext_userArn',
        userAgent: req.headers['user-agent'] || '',
        user: 'localContext_user',
      },
    },
    resource: 'localContext_resource',
    httpMethod: req.method.toUpperCase(),
    queryStringParameters: req.query || {},
    body: JSON.stringify(req.body),
    stageVariables: req.context.stageVariables || {},
  }

  if (req.user) {
    input.requestContext.authorizer = {
      principalId: req.user.principalId,
    }
  }

  return input
}

const response = (req, result) =>
  Object.assign({}, result)

const error = (req, err) => ({
  statusCode: 400,
  body: {
    message: err.message,
  },
})

module.exports = {
  event,
  response,
  error,
}
