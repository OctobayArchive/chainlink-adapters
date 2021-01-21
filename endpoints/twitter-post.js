require('dotenv').config()
const Twitter = require('twitter-lite')
const web3 = require('web3')
const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  issueId: ['issueId'],
  amount: ['amount']
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
  const url = 'https://api.github.com/graphql'
  const issueId = validator.validated.data.issueId
  const amountFormatted = Number(web3.utils.fromWei(validator.validated.data.amount.toString(), 'ether'))

  const headers = {
    Authorization: 'bearer ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }

  // Axios config
  const config = {
    url,
    headers,
    method: 'POST',
    data: {
      query: `query {
        node (id: "${issueId}") {
          ... on Issue {
            url
          }
        }
      }`
    }
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(async response => {
      // remove redundant object node
      response.data = response.data.data
      console.log(response.data)

      if (response.data.node.url) {
        const tweet = await twApp.post('statuses/update', {
          status: `${amountFormatted} #ETH for solving this issue: ${response.data.node.url} #ethereum #github #opensource #octobay`
        })
        delete response.data.node
        response.data.result = tweet.id_str
        callback(response.status, Requester.success(jobRunID, response))
      } else {
        callback(500, Requester.errored(jobRunID, { error: `Issue not found: ${issueId}` }))
      }
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, JSON.stringify(error)))
    })
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
