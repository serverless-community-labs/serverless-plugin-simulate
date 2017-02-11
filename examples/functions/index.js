'use strict'

const info = require('./info')

const handler = (event, context, callback) => {
  info.log(event, context)

  callback(null)
}


module.exports = {
  handler,
}
