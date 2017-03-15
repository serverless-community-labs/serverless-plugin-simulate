'use strict'

const escape = require('./escape')

// This is straight from serverless-offline - need to comfirm it's correctness
module.exports = () => ({
  escapeJavaScript: escape.escapeJavaScript,
  urlEncode: encodeURI,
  urlDecode: decodeURI,
  base64Encode: x => new Buffer(x.toString(), 'binary').toString('base64'),
  base64Decode: x => new Buffer(x.toString(), 'base64').toString('binary'),
  parseJson: JSON.parse,
})
