'use strict'

const lambda = require('../lambda-invoke')

const getEvent = (region, stage, method, path, authorizationToken) => ({
  type: 'TOKEN',
  authorizationToken,
  methodArn: `arn:aws:execute-api:${region}:<Account id>:<API id>/${stage}/${method}{path}`,
})

const authorize = (context, authorizationToken, log) => {
  const path = context.functionsPath
  const memorySize = context.memorySize || 1024
  const event = getEvent(
    context.region,
    context.stage,
    context.method.toLowerCase(),
    context.path,
    authorizationToken
  )

  const handler = context.authorizer.handler

  return lambda.invoke(path, handler, memorySize, event, context.environment, log)
}

module.exports = {
  authorize,
}
