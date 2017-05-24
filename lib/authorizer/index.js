'use strict'

const authorizers = {
  cognito: require('./cognito-authorizer'), // eslint-disable-line global-require
  custom: require('./custom-authorizer'), // eslint-disable-line global-require
}

const authorize = (context, authorizationToken, logger) => {
  const authorizer = authorizers['custom'] // eslint-disable-line dot-notation
  return authorizer.authorize(context, authorizationToken, logger)
}

module.exports = {
  authorize,
}
