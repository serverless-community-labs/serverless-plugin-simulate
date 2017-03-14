'use strict'

const AWS = require('aws-sdk')

const info = require('./info')


const endpoint = process.env.SERVERLESS_SIMULATE ?
  process.env.SERVERLESS_SIMULATE_LAMBDA_ENDPOINT :
  undefined

const functionName = process.env.BFF_BACKEND_FUNC

const lambda = new AWS.Lambda({
  endpoint,
})

const handler = (event, context, callback) => {
  // info.log(event, context)

  console.log(`Invoking ${functionName}`)

  const params = {
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      foo: 'bar'
    }),
  }

  lambda.invoke(params, (err, result) => {
    if (err) {
        callback(err)
        return
    }

    console.log('Recieved result', result)

    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: result.Payload
    })
  })
}

const backend = (event, context, callback) => {
  // info.log(event, context)
  console.log('Recieved event', event)
  callback(null, {
    message: 'success',
    event,
  })
}

module.exports = {
  handler,
  backend,
}
