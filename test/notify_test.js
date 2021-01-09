const assert = require('chai').assert
const createRequest = require('../endpoints/notify.js').createRequest
const TEST_GITHUB_USER = 'opintester'
const AMOUNT = 1
const CURRENCY = 'LINK'

describe('createRequest', () => {
    const jobID = '1'

    context('successful calls', () => {
        const requests = [
            {
                name: 'all parameters supplied',
                testData: { id: jobID, data: { "payment_to": TEST_GITHUB_USER, "payment_from": TEST_GITHUB_USER, "amount": AMOUNT, "currency": CURRENCY } },
            }
        ]

        requests.forEach((req) => {
            it(`${req.name}`, (done) => {
                createRequest(req.testData, (statusCode, data) => {
                    assert.equal(statusCode, 200)
                    assert.equal(data.jobRunID, jobID)
                    assert.isNotEmpty(data.data)
                    done()
                })
            })
        })
    })

    context('error calls', () => {
        const requests = [
            { name: 'empty body', testData: {} },
            { name: 'empty data', testData: { data: {} } },
            // TODO
        ]

        requests.forEach((req) => {
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
