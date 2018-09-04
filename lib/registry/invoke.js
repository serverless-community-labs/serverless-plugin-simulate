'use strict'

const data = require('./data')

//
// POST ?Qualifier=Qualifier HTTP/1.1
// X-Amz-Invocation-Type: InvocationType
// X-Amz-Log-Type: LogType
// X-Amz-Client-Context: ClientContext

// Payload
const invoke20150331 = (lambda, db, req, res) => {
  const functionName = req.params.functionName
  const invocationType = req.get('X-Amz-Invocation-Type')

  req.logger(`Looking up ${functionName} in registry`)
  // TODO: validate

  return data.getFunction(db, functionName).then((functionConfig) => {
    const event = req.body || {}

    req.logger(`Invoking ${functionName} with ${invocationType}`)
    req.logger(JSON.stringify(functionConfig))

    const invokePromise = lambda.invoke(functionConfig, event, req.logger)

    switch (invocationType) {
      case 'Event':
        res.status(200)
        res.send()
        break
      case 'RequestResponse':
      default:
        invokePromise
          .then((result) => {
            res.status(200)
            // If lambda function returns an error, set X-Amz-Function-Error header
            // to response that the error was handled.
            if (result.errorMessage !== null && result.errorMessage !== undefined) {
              res.set('X-Amz-Function-Error', 'Handled')
            }
            res.send(result)
          })
          .catch((err) => {
            req.logger('Invoking Lambda failed with error')
            req.logger(err)
            res.status(500)
            res.send()
          })
    }

    // Stop bluebird complaining
    return null
  }).catch((err) => {
    req.logger('Invoking Lambda failed with error')
    req.logger(err)
    res.status(500)
    res.send()

    // Stop bluebird complaining
    return null
  })
}

module.exports = {
  invoke20150331,
}
