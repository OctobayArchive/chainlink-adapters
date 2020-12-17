require('dotenv').config()
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
  githubUser: ['githubUser'],
  issueId: ['issueId']
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const url = 'https://api.github.com/graphql'
  const githubUser = validator.validated.data.githubUser
  const issueId = validator.validated.data.issueId

  const headers = {
    Authorization: 'bearer ' + process.env.GITHUB_APP_ACCESS_TOKEN
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
            repository {
              owner {
                login
              }
            }
          }
        }
      }`
    }
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // remove redundant object node
      response.data = response.data.data

      if (response.data.node.repository.owner.login !== githubUser) {
        // Error 1: GitHub user does not own the issue's repository
        callback(500, Requester.errored(jobRunID, { registrationError: `Repository of issue not owned by ${githubUser}.` }))
      } else {
        delete response.data.node
        response.data.result = true
        callback(response.status, Requester.success(jobRunID, response))
      }
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
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
