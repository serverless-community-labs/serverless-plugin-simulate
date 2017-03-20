'use strict'

const data = require('./data')

const putFunctions = (db, req, res, dist) => {
  const body = req.body
  const functions = (body.functions || []).map(f =>
    Object.assign({}, f, {
      servicePath: `${f.servicePath}${dist}`,
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
