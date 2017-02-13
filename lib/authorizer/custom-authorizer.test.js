'use strict'

const authorizer = require('./custom-authorizer')

describe('custom authorizer', () => {
  it('execute authorize', () => {
    const lambda = {
      invoke: jest.fn(),
    }

    const functionConfig = {
      environment: {},
      functionName: 'authorizer',
      handler: 'index.authorizer',
      memorySize: 512,
      region: 'us-east-1',
      runtime: 'nodejs4.3',
      stage: 'test',
      timeout: 3,
    }
    const context = {
      region: 'us-east-1',
      stage: 'dev',
      http: {
        method: 'GET',
        path: '/',
        authorizer: {
          name: 'authorizer',
          function: functionConfig,
        },
      },
    }

    const authorizationToken = 'TOKEN 12345'

    authorizer.authorize(lambda, context, authorizationToken)

    expect(lambda.invoke.mock.calls.length).toEqual(1)
    expect(lambda.invoke.mock.calls[0][0]).toEqual(functionConfig)
    expect(lambda.invoke.mock.calls[0][1]).toEqual({
      type: 'TOKEN',
      authorizationToken,
      methodArn: 'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/get/',
    })
  })
})
