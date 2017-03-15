'use strict'

const jp = require('jsonpath')

module.exports = (req, headers, body) => {
  const path = x => {
    const result = jp.query(body, x)
    return result[0]
  }

  return {
    body: JSON.stringify(body), // Not a string yet, todo
    json: pathExp => JSON.stringify(path(pathExp)),
    params: param => {
      if (typeof param === 'string') {
        return req.params[param] || req.query[param] || headers[param]
      }

      return {
        path: Object.assign({}, req.params),
        querystring: Object.assign({}, req.query),
        header: headers,
      }
    },
    path,
  }
}
