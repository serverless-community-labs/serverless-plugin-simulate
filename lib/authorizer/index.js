const authorizers = {
  'custom': require('./custom-authorizer'),
}

const authorize = (context, authorizationToken) => {
  const authorizer = authorizers['custom']
  return authorizer.authorize(context, authorizationToken)
}

module.exports = {
  authorize,
}