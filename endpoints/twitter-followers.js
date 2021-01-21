require('dotenv').config()
const Twitter = require('twitter-lite')
const cache = require('memory-cache')
const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  accountId: ['accountId']
}

const twApp = new Twitter({
  subdomain: 'api',
  version: '1.1',
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token_key: process.env.TWITTER_APP_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_APP_SECRET
})

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const accountId = validator.validated.data.accountId

  const response = { data: { result: cache.get('twitter-followers-' + accountId) } }
  if (response.data.result) {
    callback(200, Requester.success(jobRunID, response))
  } else {
    twApp.get('users/show', {
      user_id: accountId
    }).then(user => {
      response.data.result = user.followers_count
      cache.put('twitter-followers-' + accountId, response.data.result, 60 * 1000)
      callback(200, Requester.success(jobRunID, response))
    }).catch(error => {
      callback(500, Requester.errored(jobRunID, JSON.stringify(error)))
    })
  }
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
