'use strict'

const context = require('./context')

describe('context', () => {
  describe('escapeJavaScript', () => {
    it('should escape string', () => {
      const actual = context.escapeJavaScript('"Hello World!"')
      expect(actual).toEqual('\\"Hello World!\\"')
    })

    it('should escape object', () => {
      const actual = context.escapeJavaScript({
        message: '"Hello World!"',
      })
      expect(actual).toEqual('{"message":"\\\\\\"Hello World!\\\\\\""}')
    })

    it('should escape function', () => {
      const func = () => 1 + 1
      const actual = context.escapeJavaScript(func)
      expect(actual).toEqual('() => 1 + 1')
    })

    it('should escape number', () => {
      const actual = context.escapeJavaScript(1)
      expect(actual).toEqual('1')
    })

    it('should escape bool', () => {
      const actual = context.escapeJavaScript(true)
      expect(actual).toEqual('true')
    })

    it('should escape null', () => {
      const actual = context.escapeJavaScript(null)
      expect(actual).toEqual(null)
    })

    it('should escape undefined', () => {
      const actual = context.escapeJavaScript(undefined)
      expect(actual).toEqual(undefined)
    })
  })

  describe('createFromRequest', () => {
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
      },
      connection: {
        remoteAddress: '127.0.0.1',
      },
      body: {
        hello: 'world',
      },
    }

    it('should create context', () => {
      const expected = {
        context: {
          apiId: 'offlineContext_apiId',
          authorizer: {
            principalId: req.context.authorizer.principalId,
          },
          httpMethod: req.method.toUpperCase(),
          stage: req.context.stage,
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
        stageVariables: req.context.stageVariables || {},
      }

      const actual = context.createFromRequest(req)
      delete actual.context.requestId
      delete actual.util
      delete actual.input

      expect(actual).toEqual(expected)
    })
  })
})
