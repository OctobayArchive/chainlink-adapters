const createRegisterRequest = require('./endpoints/register').createRequest
const createReleaseRequest = require('./endpoints/release').createRequest
const createClaimRequest = require('./endpoints/claim').createRequest
const createGraphqlRequest = require('./endpoints/graphql').createRequest
const createNotifyRequest = require('./endpoints/notify').createRequest
const createTwitterPostRequest = require('./endpoints/twitter-post').createRequest
const createTwitterFollowersRequest = require('./endpoints/twitter-followers').createRequest

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.EA_PORT || 8080

app.use(bodyParser.json())

app.post('/register', (req, res) => {
  console.log('POST Data: ', req.body)
  createRegisterRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.post('/release', (req, res) => {
  console.log('POST Data: ', req.body)
  createReleaseRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.post('/claim', (req, res) => {
  console.log('POST Data: ', req.body)
  createClaimRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.post('/graphql', (req, res) => {
  console.log('POST Data: ', req.body)
  createGraphqlRequest(req.body, (status, result) => {
    console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.post('/notify', (req, res) => {
  console.log('POST Data: ', req.body)
  createNotifyRequest(req.body, (status, result) => {
    res.status(status).json(result)
  })
})

app.post('/twitter-post', (req, res) => {
  console.log('POST Data: ', req.body)
  createTwitterPostRequest(req.body, (status, result) => {
    res.status(status).json(result)
  })
})

app.post('/twitter-followers', (req, res) => {
  console.log('POST Data: ', req.body)
  createTwitterFollowersRequest(req.body, (status, result) => {
    res.status(status).json(result)
  })
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
