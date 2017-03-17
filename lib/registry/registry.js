'use strict'

const data = require('./data')

const putFunctions = (db, req, res, servicesPathDest) => {
  const body = req.body
  let functions = body.functions

  functions = functions.map((_function) =>
    Object.assign({}, _function, {
      servicePath: `${_function.servicePath}${servicesPathDest}`,
    })
  )
  // TODO: validate
  data.putFunctions(db, functions).then(() => {
    res.status(200)
    res.send()
  })
}

module.exports = {
  putFunctions,
}
