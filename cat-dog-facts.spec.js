const { spy, stub } = require('sinon')
const { getFacts } = require('./cat-dog-facts')

const catFactsUrl = 'https://catfact.ninja/facts?limit=300'
const dogFactsUrl = 'https://dog-api.kinduff.com/api/facts?number=100'

test('should fetch cat facts and dog facts', done => {
  const catFact = {
    json: () => Promise.resolve(getCatFact())
  }
  const dogFact = {
    json: () => Promise.resolve(getDogFact())
  }
  const fetch = stub()
  fetch.onCall(0).returns(Promise.resolve(catFact))
  fetch.onCall(1).returns(Promise.resolve(dogFact))

  const Math = {
    floor: stub().returns(0),
    random: stub().returns(0)
  }

  const expected = getCatFact().data[0].fact

  const cb = (err, res) => {
    expect(err).toEqual(null)
    expect(fetch.callCount).toEqual(2)
    expect(fetch.args[0][0]).toEqual(catFactsUrl)
    expect(fetch.args[1][0]).toEqual(dogFactsUrl)
    expect(Math.random.callCount).toEqual(1)
    expect(Math.floor.callCount).toEqual(1)
    expect(res).toEqual(expected)
    done()
  }

  return getFacts(Math, fetch, cb)
})

test('should catch errors if either dog facts or cat facts were unretrievable', done => {
  const fetch = stub().returns(Promise.reject('error'))

  const cb = (err, res) => {
    expect(err).toEqual('error')
    expect(fetch.callCount).toEqual(2)
    expect(fetch.args[0][0]).toEqual(catFactsUrl)
    expect(fetch.args[1][0]).toEqual(dogFactsUrl)
    done()
  }
  return getFacts({}, fetch, cb)
})

function getDogFact() {
  return {
    facts: ['Average body temperature for a dog is 101.2 degrees.'],
    success: true
  }
}

function getCatFact() {
  return {
    total: 311,
    per_page: '1',
    current_page: 1,
    last_page: 311,
    next_page_url: 'https://catfact.ninja/facts?page=2',
    prev_page_url: null,
    from: 1,
    to: 1,
    data: [
      {
        fact:
          'A 2007 Gallup poll revealed that both men and women were equally likely to own a cat.',
        length: 85
      }
    ]
  }
}
