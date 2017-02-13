'use strict'

const data = require('./data')

const putFunctions = (db, req, res) => {
  const body = req.body
  const functions = body.functions
  // TODO: validate
  data.putFunctions(db, functions).then(() => {
    res.status(200)
    res.send()
  })
}

module.exports = {
  putFunctions,
}
