# Chainlink NodeJS External Adapter for OctoBay: Claim Pull Requests

Template: https://github.com/thodges-gh/CL-EA-NodeJS-Template

## Input Params

- `githubUser`: The GitHub user trying to claim the pull request
- `prId`: The graphql node ID of the pull request

## Output

```json
{
  "jobRunID": 0,
  "data": {
    "pullRequest": {
      "id": "MDExOlB1bGxSZXF1ZXN0NDc2NTg4Nzg2",
      "mergedAt": "2020-09-04T15:24:16Z",
      "author": [Object],
      "repository": [Object],
      "score": 43
    },
    "result": 43
  },
  "result": 43,
  "statusCode": 200
}
```

## Install Locally

Install dependencies:

```bash
yarn
```

### Test

Run the local tests:

```bash
yarn test
```

Natively run the application (defaults to port 8080):

### Run

```bash
yarn start
```

## Call the external adapter/API server

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": { "githubUser": "mktcode", "prId": "MDExOlB1bGxSZXF1ZXN0NDc2NTg4Nzg2" } }'
```
