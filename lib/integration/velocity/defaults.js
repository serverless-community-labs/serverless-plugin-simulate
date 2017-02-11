'use strict'

const JSON_REQUEST_TEMPLATE = `
  #define( $loop )
    {
    #foreach($key in $map.keySet())
        "$util.escapeJavaScript($key)":
          "$util.escapeJavaScript($map.get($key))"
          #if( $foreach.hasNext ) , #end
    #end
    }
  #end

  {
    "body": $input.json("$"),
    "method": "$context.httpMethod",
    "principalId": "$context.authorizer.principalId",
    "stage": "$context.stage",

    #set( $map = $input.params().header )
    "headers": $loop,

    #set( $map = $input.params().querystring )
    "query": $loop,

    #set( $map = $input.params().path )
    "path": $loop,

    #set( $map = $context.identity )
    "identity": $loop,

    #set( $map = $stageVariables )
    "stageVariables": $loop
  }
`


const RESPONSE_STATUS_CODES = [{
  statusCode: 200,
  pattern: '',
  parameters: {},
  template: '',
}, {
  statusCode: 400,
  pattern: '.*\\[400\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 401,
  pattern: '.*\\[401\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 403,
  pattern: '.*\\[403\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 404,
  pattern: '.*\\[404\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 422,
  pattern: '.*\\[422\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 500,
  pattern: '.*(Process\\s?exited\\s?before\\s?completing\\s?request|\\[500\\]).*',
  parameters: {},
  template: '',
}, {
  statusCode: 502,
  pattern: '.*\\[502\\].*',
  parameters: {},
  template: '',
}, {
  statusCode: 504,
  pattern: '.*\\[504\\].*',
  parameters: {},
  template: '',
}]

module.exports = {
  JSON_REQUEST_TEMPLATE,
  RESPONSE_STATUS_CODES,
}
