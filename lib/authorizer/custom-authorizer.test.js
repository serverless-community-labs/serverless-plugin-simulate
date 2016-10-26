'use strict'

const path = require('path')

const authorizer = require('./custom-authorizer')

describe('custom authorizer', () => {
  const context = {
    functionsPath: path.resolve(process.cwd()),
    region: 'us-east-1',
    stage: 'dev',
    method: 'GET',
    path: '/',
    authorizer: {
      handler: 'examples/functions/authorizer.handler',
    },
  }

  const authorizationToken = 'TOKEN 12345'

  it('execute authorize', () => {
    const expected = {
      policyDocument: {
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: ['arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/*/*'],
        }],
        Version: '2012-10-17',
      },
      principalId: '12345',
    }
    return authorizer.authorize(context, authorizationToken)
    .then(result => expect(result).toEqual(expected))
  })
})
