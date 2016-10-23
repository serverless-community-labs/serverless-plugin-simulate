const event = (req) => { 
  const input = {
    path: req.url,
    headers: req.headers,
    pathParameters: req.params || {},
    requestContext: {
      accountId: 'offlineContext_accountId',
      resourceId: 'offlineContext_resourceId',
      stage: req.context.stage,
      requestId: `offlineContext_requestId_${Math.random().toString(10).slice(2)}`,
      identity: {
        cognitoIdentityPoolId: 'offlineContext_cognitoIdentityPoolId',
        accountId: 'offlineContext_accountId',
        cognitoIdentityId: 'offlineContext_cognitoIdentityId',
        caller: 'offlineContext_caller',
        apiKey: 'offlineContext_apiKey',
        sourceIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        cognitoAuthenticationType: 'offlineContext_cognitoAuthenticationType',
        cognitoAuthenticationProvider: 'offlineContext_cognitoAuthenticationProvider',
        userArn: 'offlineContext_userArn',
        userAgent: req.headers['user-agent'] || '',
        user: 'offlineContext_user',
      },
    },
    resource: 'offlineContext_resource',
    httpMethod: req.method.toUpperCase(),
    queryStringParameters: req.query || {},
    body: JSON.stringify(req.body),
    stageVariables: req.context.stageVariables || {},
  }

  if (req.context.authorizer) {
    input.requestContext.authorizer = {
      principalId: req.context.authorizer.principalId,
    }
  }

  return input
}

const response = (req, result) => 
  Object.assign({}, result)

module.exports = {
  event,
  response,
}
