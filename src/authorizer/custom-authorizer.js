const BbPromise = require('bluebird')
const lambda = require('../lambda-invoke')

const authorize = (context, authorizationToken) => {
  console.log('Custom authorizer...')

  const event = {
    type: 'TOKEN',
    authorizationToken,
    methodArn: `arn:aws:execute-api:${context.region}:<Account id>:<API id>/${context.stage}/${context.method}/{context.endpoint}`,
  }

  return lambda.invoke(context.path, context.authorizer.handler, event)
}

module.exports = {
  authorize,
}