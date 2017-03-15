'use strict'

const createUtil = require('./util')

// The implementation of util is straight from serverless-offline
// need to comfirm it's correctness
describe('util', () => {
  it('should base64Encode', () => {
    const util = createUtil()

    const buff = new Buffer('test', 'utf8')
    const b64 = util.base64Encode(buff)

    expect(b64).toEqual('dGVzdA==')
  })

  it('should base64Decode', () => {
    const util = createUtil()

    const buff = new Buffer('dGVzdA==', 'base64')
    const decoded = util.base64Decode(buff)

    expect(decoded).toEqual('µë-')
  })
})
