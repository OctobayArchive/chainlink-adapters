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
  githubUserId: ['githubUserId'],
  repoOrgId: ['repoOrgId']
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const url = 'https://api.github.com/graphql'
  const githubUserId = validator.validated.data.githubUserId
  const repoOrgId = validator.validated.data.repoOrgId

  const headers = {
    Authorization: 'bearer ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }

  // Check if node ID for repoOrgId is a repo or org
  const checkRepoOrOrg = {
    url,
    headers,
    method: 'POST',
    data: {
      query: `query($repoOrgId:ID!) { 
        node(id: $repoOrgId) {
           __typename
           ... on Organization {
               login
           }
           ... on Repository {
               owner {
                   __typename
                   ... on Organization {
                       login
                   }
                   ... on User {
                       id
                   }
               }
           }
        }
      }`,
      variables: {
        repoOrgId
      }
    }
  }

  // Check if user is a member of a given organization
  const checkUserMember = (orgLogin) => {
    return {
      url,
      headers,
      method: 'POST',
      data: {
        query: `query($githubUserId:ID!, $orgLogin:String!) { 
          node(id: $githubUserId) {
            __typename
            ... on User {
                organization(login: $orgLogin) {
                    id
                }
            }
          }
        }`,
        variables: {
          githubUserId,
          orgLogin
        }
      }
    }
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(checkRepoOrOrg, customError)
    .then(response => {
      // remove redundant object node
      response.data = response.data.data

      const nodeType = response.data.node.__typename
      if (nodeType !== 'Repository' && nodeType !== 'Organization') {
        callback(500, Requester.errored(jobRunID, { checkOwnershipError: `Node (${repoOrgId}) is not a Repository or Organization.` }))
      } else {
        const ownerType = nodeType === 'Repository' ? response.data.node.owner.__typename : null

        if (nodeType === 'Repository' && ownerType === 'User') {
          if (response.data.node.owner.id !== githubUserId) {
            callback(500, Requester.errored(jobRunID, { checkOwnershipError: `Repository (${repoOrgId}) is not owned by User (${githubUserId}).` }))
          } else {
            callback(200, Requester.success(jobRunID, { status: 200, data: { result: true } }))
          }
        } else {
          const orgLogin = nodeType === 'Organization' ? response.data.node.login : response.data.node.owner.login
          Requester.request(checkUserMember(orgLogin), customError)
            .then(response => {
              // remove redundant object node
              response.data = response.data.data

              if (response.data.node.__typename !== 'User') {
                callback(500, Requester.errored(jobRunID, { checkOwnershipError: `Node (${githubUserId}) is not a User.` }))
              } else {
                if (!response.data.node.organization) {
                  callback(500, Requester.errored(jobRunID, { checkOwnershipError: `Node (${githubUserId}) is not an Organization.` }))
                } else {
                  callback(200, Requester.success(jobRunID, { status: 200, data: { result: true } }))
                }
              }
            })
            .catch(error => {
              console.log(error)
              callback(500, Requester.errored(jobRunID, JSON.stringify(error)))
            })
        }
      }
    })
    .catch(error => {
      console.log(error)
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
