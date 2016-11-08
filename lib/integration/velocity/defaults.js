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
  StatusCode: 200,
  SelectionPattern: '',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 400,
  SelectionPattern: '.*\\[400\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 401,
  SelectionPattern: '.*\\[401\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 403,
  SelectionPattern: '.*\\[403\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 404,
  SelectionPattern: '.*\\[404\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 422,
  SelectionPattern: '.*\\[422\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 500,
  SelectionPattern: '.*(Process\\s?exited\\s?before\\s?completing\\s?request|\\[500\\]).*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 502,
  SelectionPattern: '.*\\[502\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}, {
  StatusCode: 504,
  SelectionPattern: '.*\\[504\\].*',
  ResponseParameters: {},
  ResponseTemplates: {},
}]

module.exports = {
  JSON_REQUEST_TEMPLATE,
  RESPONSE_STATUS_CODES,
}
