'use strict'

const info = require('./info')

const success = (event, context, callback) => {
  info.log(event, context)

  callback(null, { statusCode: 200, body: JSON.stringify([]) })
}

const error = (event, context, callback) => {
  info.log(event, context)

  callback(null, { statusCode: 500 })
}

const unhandled = (event, context, callback) => {
  info.log(event, context)

  throw new Error('Test')
}

module.exports = {
  success,
  error,
  unhandled,
}
