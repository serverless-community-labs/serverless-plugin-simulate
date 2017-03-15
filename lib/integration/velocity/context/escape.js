'use strict'

const jsEscapeString = require('js-string-escape')
const isPlainObject = require('lodash.isplainobject')

const escapeJavaScript = (x) => {
  if (typeof x === 'string') {
    return jsEscapeString(x).replace(/\\n/g, '\n')
  } else if (isPlainObject(x)) {
    const result = {}

    Object.keys(x).forEach((key) => {
      result[key] = jsEscapeString(x[key])
    })

    return JSON.stringify(result)
  } else if (x && typeof x.toString === 'function') {
    return escapeJavaScript(x.toString())
  }

  return x
}


module.exports = {
  escapeJavaScript,
}
