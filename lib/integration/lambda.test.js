'use strict'

const integration = require('./lambda')
const velocityDefaults = require('./velocity/defaults')

describe('lambda integration', () => {
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
        principalId: '12345',
      },
      stageVariables: {},
      requestTemplate: velocityDefaults.JSON_REQUEST_TEMPLATE,
      responseMappings: velocityDefaults.RESPONSE_STATUS_CODES,
    },
    connection: {
      remoteAddress: '127.0.0.1',
    },
    body: {
      hello: 'world',
    },
  }

  describe('event', () => {
    it('execute event', () => {
      const expected = {
        body: req.body,
        method: req.method.toUpperCase(),
        principalId: req.context.authorizer.principalId,
        stage: req.context.stage,
        headers: {
          'User-Agent': 'test-user-agent',
        },
        query: {},
        path: {},
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
        stageVariables: req.context.stageVariables || {},
      }

      const actual = integration.event(req)

      expect(actual).toEqual(expected)
    })
  })

  describe('response', () => {
    it('execute response', () => {
      const result = { foo: 'bar' }
      const expected = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(result),
      }

      const actual = integration.response(req, result)
      expect(actual).toEqual(expected)
    })
  })
})
