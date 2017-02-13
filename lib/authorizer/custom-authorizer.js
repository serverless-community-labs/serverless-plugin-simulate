'use strict'

const getEvent = (region, stage, method, path, authorizationToken) => ({
  type: 'TOKEN',
  authorizationToken,
  methodArn: `arn:aws:execute-api:${region}:<Account id>:<API id>/${stage}/${method}${path}`,
})

const authorize = (lambda, context, authorizationToken, log) => {
  const http = context.http

  const event = getEvent(
    context.region,
    context.stage,
    http.method.toLowerCase(),
    http.path,
    authorizationToken
  )

  return lambda.invoke(http.authorizer.function, event, log)
}

module.exports = {
  authorize,
}
