const BbPromise = require('bluebird')

const fetch = (options, req) => {
  console.log('Fetch handler...')

  const context = {
    region: options.region || 'us-east-1',
    stage: options.stage,
    handler: 'index.handler',
    integration: 'lambda-proxy',
    authorizer: { 
      handler: 'authorizer.handler',
      identitySource: 'Authorization',
      authorizerType: 'custom',
    },
    path: options.path,
    endpoint: options.endpoint,
    stageVariables: {},
  }

  return BbPromise.resolve(context)
}

module.exports = {
  fetch,
}