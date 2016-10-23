const authorizers = {
  'custom': require('./custom-authorizer'),
}

const authorize = (context, authorizationToken) => {
  console.log('Authorizing...')
  const authorizer = authorizers[context.authorizer.authorizerType]
  return authorizer.authorize(context, authorizationToken)
}

module.exports = {
  authorize,
}