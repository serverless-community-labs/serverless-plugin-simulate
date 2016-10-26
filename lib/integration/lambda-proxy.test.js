'use strict'

const integration = require('./lambda-proxy')

describe('lambda proxy integration', () => {
  const req = {
    url: '/',
    method: 'GET',
    headers: {
      'user-agent': 'test-user-agent',
    },
    params: {},
    query: {},
    context: {
      stage: 'dev',
      authorizer: {
        principalId: 12345,
      },
      stageVariables: {},
    },
    connection: {
      remoteAddress: '127.0.0.1',
    },
    body: {
      hello: 'world',
    },
  }

  it('execute event', () => {
    const expected = {
      path: req.url,
      headers: req.headers,
      pathParameters: req.params || {},
      requestContext: {
        accountId: 'offlineContext_accountId',
        authorizer: {
          principalId: req.context.authorizer.principalId,
        },
        resourceId: 'offlineContext_resourceId',
        stage: req.context.stage,
        // requestId: 'offlineContext_requestId_4652394100558013',
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

    const actual = integration.event(req)
    delete actual.requestContext.requestId // ignore generated field

    expect(actual).toEqual(expected)
  })

  it('execute response', () => {
    const result = { statusCode: 200 }

    expect(integration.response(req, result)).toEqual(result)
  })
})
