'use strict'

const path = require('path')
const expect = require('expect')

const authorizer = require('./custom-authorizer')

describe('custom authorizer', () => {
  const context = {
    functionsPath: path.resolve(process.cwd()),
    region: 'us-east-1',
    stage: 'dev',
    method: 'GET',
    path: '/',
    authorizer: {
      handler: 'example/functions/authorizer.handler',
    },
  }

  console.log(JSON.stringify(context)) // eslint-disable-line no-console

  const authorizationToken = 'TOKEN 12345'

  it('execute authorize', () => {
    const result = authorizer.authorize(context, authorizationToken)
    console.log(JSON.stringify(result)) // eslint-disable-line no-console
    expect(result)
      .toEqual({ principalId: 12345, policyDocument: {} })
  })
})
