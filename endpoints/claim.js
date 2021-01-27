require('dotenv').config()
const { Requester, Validator } = require('@chainlink/external-adapter')
const graphqlUrl = 'https://api.github.com/graphql'

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

const headers = {
  Authorization: 'bearer ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN
}

const getIssueClosedEvents = (issueId, after, result = { closedEvents: [], body: '' }) => {
  return Requester.request({
    url: graphqlUrl,
    data: {
      query: `query {
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
        node(id:"${issueId}") {
          ... on Issue {
            body
            timelineItems(itemTypes: [CLOSED_EVENT], first: 1${after ? ', after: "' + after + '"' : ''}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                ... on ClosedEvent {
                  closer {
                    ... on PullRequest {
                      author {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`
    },
    method: 'POST',
    headers
  }, customError).then(res => {
    result.body = res.data.data.node.body
    result.closedEvents.push(...res.data.data.node.timelineItems.nodes)
    if (res.data.data.node.timelineItems.pageInfo.hasNextPage) {
      return getIssueClosedEvents(issueId, res.data.data.node.timelineItems.pageInfo.endCursor, result)
    } else {
      return result
    }
  }).catch(e => console.log(e))
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const githubUser = validator.validated.data.githubUser
  const issueId = validator.validated.data.issueId

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  getIssueClosedEvents(issueId).then(result => {
    let releasedByPullRequest = false
    result.closedEvents.forEach(closedEvent => {
      if (closedEvent.closer && closedEvent.closer.author.login === githubUser) {
        releasedByPullRequest = true
      }
    })

    const releaseCommandRegex = new RegExp(`^(\\s+)?@OctoBay([ ]+)release([ ]+)to([ ]+)@${githubUser}(\\s+)?$`, 'igm')
    const releasedByCommand = !!result.body.match(releaseCommandRegex)

    if (releasedByCommand || releasedByPullRequest) {
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
