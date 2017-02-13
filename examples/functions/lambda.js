'use strict'

const info = require('./info')

const success = (event, context, callback) => {
  info.log(event, context)

  callback(null, event)
}

const error = (event, context, callback) => {
  info.log(event, context)

  callback('[409] this is not the droid you are looking for')
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
