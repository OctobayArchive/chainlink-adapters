# Chainlink NodeJS External Adapter for OctoBay

Template: https://github.com/thodges-gh/CL-EA-NodeJS-Template

## /register

### Input Params

- `githubUser`: The GitHub user trying to register
- `ethAccount`: The ETH account the user wants to connect to

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
curl -X POST -H "content-type:application/json" "http://localhost:8080/register" --data '{ "id": 0, "data": { "githubUser": "mktcode", "ethAccount": "0x2771..." } }'

# release
curl -X POST -H "content-type:application/json" "http://localhost:8080/release" --data '{ "id": 0, "data": { "githubUser": "mktcode", "issueId": "MDExOlB..." } }'

# claim
curl -X POST -H "content-type:application/json" "http://localhost:8080/claim" --data '{ "id": 0, "data": { "githubUser": "mktcode", "prId": "MDExOlB..." } }'
```
