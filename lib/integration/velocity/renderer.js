
'use strict'

const Velocity = require('velocityjs')

// Might be able to cache template
const getCompiledTemplate = (template) => {
  const asts = Velocity.parse(template)
  return new Velocity.Compile(asts)
}


const render = (template, context) => {
  const compiledTemplate = getCompiledTemplate(template)
  return compiledTemplate.render(context)
}

module.exports = {
  render,
}
