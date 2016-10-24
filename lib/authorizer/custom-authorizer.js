const BbPromise = require('bluebird')
const lambda = require('../lambda-invoke')

const getEvent = (region, stage, method, path, authorizationToken) => ({
    type: 'TOKEN',
    authorizationToken,
    methodArn: `arn:aws:execute-api:${region}:<Account id>:<API id>/${stage}/${method}{path}`,
  })

function authorize(context, authorizationToken) {
  const path = context.functionsPath
  const event = getEvent(context.region, context.stage, context.method.toLowerCase(), context.path, authorizationToken)
  const handler = context.authorizer.handler

  return lambda.invoke(path, handler, event)
}

module.exports = {
  authorize,
}