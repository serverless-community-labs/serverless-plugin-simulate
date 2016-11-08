const logHandlerInfo = (event, context) => {
  console.log(process.execPath)
  console.log(process.execArgv)
  console.log(process.argv)
  console.log(process.cwd())
  console.log(process.mainModule.filename)
  console.log(__filename)
  console.log(process.env)
  console.log(process.getuid())
  console.log(process.getgid())
  console.log(process.geteuid())
  console.log(process.getegid())
  console.log(process.getgroups())
  console.log(process.umask())

  console.log(event)

  console.log(context)

  context.callbackWaitsForEmptyEventLoop = false

  console.log(context.getRemainingTimeInMillis())
}

const lambdaSuccessHandler = (event, context, callback) => {
  logHandlerInfo(event, context)

  callback(null, event)
}

const lambdaErrorHandler = (event, context, callback) => {
  logHandlerInfo(event, context)

  callback('[404] this is not the droid you are looking for')
}

const lambdaProxySuccessHandler = (event, context, callback) => {
  logHandlerInfo(event, context)

  callback(null, { statusCode: 200, body: JSON.stringify([]) })
}

const lambdaProxyErrorHandler = (event, context, callback) => {
  logHandlerInfo(event, context)

  callback(null, { statusCode: 500 })
}

module.exports = {
  lambdaSuccessHandler,
  lambdaErrorHandler,
  lambdaProxySuccessHandler,
  lambdaProxyErrorHandler,
}
