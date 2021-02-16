# Chainlink NodeJS External Adapters for OctoBay

Template: https://github.com/thodges-gh/CL-EA-NodeJS-Template

## /register

### Input Params

- `githubUser`: The GitHub user trying to register
- `ethAddress`: The ETH address the user wants to connect to (as a decimal representation)

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

## /release

### Input Params

- `githubUser`: The GitHub user that owns the issue and wants to release its deposits
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

## /claim

### Input Params

- `githubUser`: The GitHub user trying to claim the pull request
- `prId`: The GrapQL node ID of the pull request

### Output

```
{
  "jobRunID": 0,
  "data": {
    "pullRequest": {
      "id": "MDExOlB1bGxSZXF1ZXN0NDc2NTg4Nzg2",
      "mergedAt": "2020-09-04T15:24:16Z",
      "author": { ... },
      "repository": { ... },
      "score": 43
    },
    "result": 43
  },
  "result": 43,
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
GITHUB_APP_ACCESS_TOKEN=...
MAX_PULL_REQUEST_MERGE_AGE=30
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

Install dependencies:

```bash
yarn
```

## Test

Run the local tests:

```bash
yarn test
```

Natively run the application (defaults to port 8080):

## Run

```bash
yarn start
```

## Call

```bash
# register
curl -X POST -H "content-type:application/json" "http://localhost:8080/register" --data '{ "id": 0, "data": { "githubUser": "mktcode", "ethAddress": "1234..." } }'

# release
curl -X POST -H "content-type:application/json" "http://localhost:8080/release" --data '{ "id": 0, "data": { "githubUser": "mktcode", "issueId": "MDExOlB..." } }'

# claim
curl -X POST -H "content-type:application/json" "http://localhost:8080/claim" --data '{ "id": 0, "data": { "githubUser": "mktcode", "prId": "MDExOlB..." } }'

# graphql
curl -X POST -H "content-type:application/json" "http://localhost:8080/graphql" --data '{ "id": 0, "data": { "nodeId": "MDExOlB...", "nodeType": "Issue", "nodePath": "repository.stargazers.totalCount" } }'

# notify
curl -X POST -H "content-type:application/json" "http://localhost:8080/notify" --data '{ "id": 0, "data": {"payment_to":"PatrickAlphaC", "payment_from":"opintester", "amount":1, "currency":"LINK" } }'
```
