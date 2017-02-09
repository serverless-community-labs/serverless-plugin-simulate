'use strict'

const customAuthorizer = {
  authorize: jest.fn(),
}

jest.mock('./custom-authorizer', () => customAuthorizer)

const authorizer = require('./index')

describe('authorizer', () => {
  beforeEach(() => {
    customAuthorizer.authorize.mockClear()
  })

  it('should invoke custom authorizer', () => {
    const context = {}
    const authorizationToken = 'Bearer token'

    authorizer.authorize(context, authorizationToken)

    expect(customAuthorizer.authorize.mock.calls.length).toBe(1)
    expect(customAuthorizer.authorize.mock.calls[0][0]).toBe(context)
    expect(customAuthorizer.authorize.mock.calls[0][1]).toBe(authorizationToken)
  })
})
