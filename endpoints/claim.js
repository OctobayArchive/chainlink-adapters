require('dotenv').config()
const { claimAdapter } = require('@octobay/adapters')
const { Requester, Validator } = require('@chainlink/external-adapter')

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
  const githubUser = validator.validated.data.githubUser
  const issueId = validator.validated.data.issueId

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  claimAdapter(githubUser, issueId).then(result => {
    if (result.releasedByCommand || result.releasedByPullRequest) {
      callback(200, Requester.success(jobRunID, { status: 200, data: { result: true } }))
    } else {
      callback(500, Requester.errored(jobRunID, 'Unauthorized to claim.'))
    }
  }).catch(error => {
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
