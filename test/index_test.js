const assert = require('chai').assert
const createRequest = require('../index.js').createRequest

describe('createRequest', () => {
  const jobID = '1'
  const testPrId = 'MDExOlB1bGxSZXF1ZXN0NDc2NTg4Nzg2'
  const testGitHubUser = 'mktcode'

  context('successful calls', () => {
    // MDExOlB1bGxSZXF1ZXN0NDc2NTg4Nzg2 will fail once this pr gets too old
    const requests = [
      { name: 'id not supplied', testData: { data: { githubUser: testGitHubUser, prId: testPrId } } },
      { name: 'check pull request', testData: { id: jobID, data: { githubUser: testGitHubUser, prId: testPrId } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200)
          assert.equal(data.jobRunID, jobID)
          assert.isNotEmpty(data.data)
          assert.isAbove(Number(data.result), 0)
          assert.isAbove(Number(data.data.result), 0)
          done()
        })
      })
    })
  })

  context('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      { name: 'githubUser not supplied', testData: { id: jobID, data: { prId: testPrId } } },
      { name: 'prId not supplied', testData: { id: jobID, data: { githubUser: testGitHubUser } } },
      { name: 'unknown githubUser', testData: { id: jobID, data: { GitHub: '', prId: testPrId } } },
      { name: 'unknown prId', testData: { id: jobID, data: { githubUser: testGitHubUser, prId: '' } } }
    ]

    requests.forEach(req => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 500)
          assert.equal(data.jobRunID, jobID)
          assert.equal(data.status, 'errored')
          assert.isNotEmpty(data.error)
          done()
        })
      })
    })
  })
})
