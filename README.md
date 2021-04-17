# Chainlink NodeJS External Adapters for OctoBay

Template: https://github.com/thodges-gh/CL-EA-NodeJS-Template

## /register

### Input Params

- `githubUserId`: The GraphQL Node ID of the GitHub user trying to register
- `ethAddress`: The ETH address the user wants to connect to (as a decimal representation)

### Output

```
{
  "jobRunID": 0,
  "data": {
    "result": 'address name'
  },
  "result": 'address name',
  "statusCode": 200
}
```

## /claim

### Input Params

- `githubUserId`: The GraphQL Node ID of the GitHub user trying to claim the bounty
- `issueId`: The GrapQL node ID of the issue

### Output

```
{
  "jobRunID": 0,
  "data": {
    "result": true
  },
  "result": true,
  "statusCode": 200
}
```

## /check-ownership

### Input Params

- `githubUserId`: The GraphQL Node ID of the GitHub user
- `repoOrgId`: The GrapQL node ID of the repository or organization

### Output

```
{
  "jobRunID": 0,
  "data": {
    "result": true
  },
  "result": true,
  "statusCode": 200
}
```

## /graphql

### Input Params

- `nodeId`: The GitHub GrapQL node ID
- `nodeType`: The GitHub GrapQL node type
- `nodePath`: The GitHub GrapQL node path

### Output

```
{
  "jobRunID": 0,
  "data": {
    "node": {
      "repository": {
        "stargazers": {
          "totalCount": 100
        }
      },
    },
    "result": 100
  },
  "result": 100,
  "statusCode": 200
}
```

## /notify

### Input Params

- `payment_to`: The repo, issue, or user you want to fund. ```ie: PatrickAlphaC```
- `payment_from`: The Github user who is funding. ```ie: PatrickAlphaC```
- `amount`: The amount of the current you want to send. ```ie: 1```
- `currency`: The currency you want to send. ```ie: LINK```

### Output

```
{
  {"jobRunID":0,
  "data":{
    ...
  },
  "result":756549810,
  "statusCode":201}
}
```

# .env

```
GITHUB_PERSONAL_ACCESS_TOKEN=
MAX_PULL_REQUEST_MERGE_AGE=99999
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_APP_ACCESS_TOKEN=
TWITTER_APP_SECRET=
TWITTER_APP_BEARER_TOKEN=
```

# .env for notify

```
OCTOBAY_ORG=opintester
OCTOBAY_REPO=opintest
NOTIFICATIONS_ISSUE_NUMBER=1
OPIN_TOKEN=...
OPIN_USERNAME=...
```

# Install Locally

Clone and install dependencies:

```bash
git clone https://github.com/octobay/chainlink-adapters octobay-chainlink-adapters
cd octobay-chainlink-adapters
yarn
```

## Test

Run the local tests:

```bash
yarn test
```

## Update

```bash
git pull
yarn
```

Check `.env.sample` for possible new env vars you need to set.

## Run

Natively run the application (defaults to port 8080):

```bash
yarn start
```

## Example Calls

```bash
# register
# Note that the ethAddress is passed as an integer.
curl -X POST -H "content-type:application/json" "http://localhost:8080/register" --data '{ "id": 0, "data": { "githubUserId": "MDQ6VXNlcjY3OTI1Nzg=", "ethAddress": "1234..." } }'

# claim
curl -X POST -H "content-type:application/json" "http://localhost:8080/claim" --data '{ "id": 0, "data": { "githubUserId": "MDQ6VXNlcjY3OTI1Nzg=", "issueId": "MDExOlB..." } }'

# graphql
curl -X POST -H "content-type:application/json" "http://localhost:8080/graphql" --data '{ "id": 0, "data": { "nodeId": "MDExOlB...", "nodeType": "Issue", "nodePath": "repository.stargazers.totalCount" } }'

# notify
curl -X POST -H "content-type:application/json" "http://localhost:8080/notify" --data '{ "id": 0, "data": { "payment_to":"PatrickAlphaC", "payment_from": "opintester", "amount": 1, "currency": "LINK" } }'
```
