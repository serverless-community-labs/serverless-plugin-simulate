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
      functionName: 'test-func',
      region: 'us-east-1',
      stage: 'test',
      servicePath: '/test/file/path',
      handler: 'index.endpoint',
      memorySize: 512,
      timeout: 3,
      runtime: 'nodejs4.3',
      environment: {},

      http: {
        integration: 'lambda-proxy',
        path: '/test/path',
        method: 'post',
        cors: null,
        authorizer: {
          name: 'authorizer',
          identitySource: 'method.request.header.Authorization',
          function: {
            environment: {},
            functionName: 'authorizer',
            handler: 'index.authorizer',
            memorySize: 512,
            region: 'us-east-1',
            runtime: 'nodejs4.3',
            servicePath: '/test/file/path',
            stage: 'test',
            timeout: 3,
          },
        },
      },
    },
    connection: {
      remoteAddress: '127.0.0.1',
    },
    body: {
      hello: 'world',
    },
    user: {
      principalId: 12345,
      userId: '22b459eb-ce07-e611-80c9-000d3aa051ca',
    },
  }

  it('execute event', () => {
    const expected = {
      path: req.url,
      headers: req.headers,
      pathParameters: req.params || {},
      requestContext: {
        accountId: 'localContext_accountId',
        authorizer: {
          principalId: req.user.principalId,
          userId: req.user.userId,
        },
        resourceId: 'localContext_resourceId',
        stage: req.context.stage,
        // requestId: 'localContext_requestId_4652394100558013',
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

    const actual = integration.event(req)
    delete actual.requestContext.requestId // ignore generated field

    expect(actual).toEqual(expected)
  })

  it('execute response', () => {
    const result = { statusCode: 200 }

    expect(integration.response(req, result)).toEqual(result)
  })

  it('should create error response', () => {
    const err = { message: 'blah' }

    expect(integration.error(req, err)).toEqual({
      statusCode: 400,
      body: { message: 'blah' },
    })
  })
})
