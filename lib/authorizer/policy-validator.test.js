'use strict'

const BbPromise = require('bluebird')

const policyValidator = require('./policy-validator')

describe('policy-validator', () => {
  const logger = jest.fn()

  beforeEach(() => {
    logger.mockImplementation((msg) => console.log(msg))
  })

  it('should get path auth info', () => {
    const methodArn = 'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/*/*'
    const allowed = true

    const authInfo = policyValidator.getPathAuth(methodArn, allowed)

    expect(authInfo).toEqual({
      method: '*',
      path: '*',
      regex: new RegExp('/(.*)'),
      allowed,
    })
  })

  it('should return authorized for wildcard', () => {
    const method = 'GET'
    const path = '/test/blah'

    const policy = {
      principalId: 'principal-id',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/*/test/*',
          ],
        }],
      },
    }

    const isAuthorized = policyValidator.isAuthorized(method, path, policy, logger)

    expect(isAuthorized).toBe(true)
  })

  it('should return unauthorized if path not allowed due to no match', () => {
    const method = 'GET'
    const path = '/blah'

    const policy = {
      principalId: 'principal-id',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/*/users/*',
          ],
        }],
      },
    }

    const isAuthorized = policyValidator.isAuthorized(method, path, policy, logger)

    expect(isAuthorized).toBe(false)
  })

  it('should return unauthorized if method not allowed', () => {
    const method = 'POST'
    const path = '/pets'

    const policy = {
      principalId: 'principal-id',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/GET/pets/*',
          ],
        }, {
          Effect: 'Deny',
          Action: [
            'execute-api:Invoke',
          ],
          Resource: [
            'arn:aws:execute-api:us-east-1:<Account id>:<API id>/dev/POST/pets/*',
          ],
        }],
      },
    }

    const isAuthorized = policyValidator.isAuthorized(method, path, policy, logger)

    expect(isAuthorized).toBe(false)
  })
})
