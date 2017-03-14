'use strict'

const mockCustomAuthorizer = {
  authorize: jest.fn(),
}

jest.mock('./custom-authorizer', () => mockCustomAuthorizer)

const authorizer = require('./index')

describe('authorizer', () => {
  beforeEach(() => {
    mockCustomAuthorizer.authorize.mockClear()
  })

  it('should invoke custom authorizer', () => {
    const context = {}
    const authorizationToken = 'Bearer token'

    authorizer.authorize(context, authorizationToken)

    expect(mockCustomAuthorizer.authorize.mock.calls.length).toBe(1)
    expect(mockCustomAuthorizer.authorize.mock.calls[0][0]).toBe(context)
    expect(mockCustomAuthorizer.authorize.mock.calls[0][1]).toBe(authorizationToken)
  })
})
