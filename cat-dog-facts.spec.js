const { spy, stub } = require('sinon')
const { getFacts, chooseRandomFact } = require('./cat-dog-facts')
const { pluck, concat } = require('ramda')

const catFactsUrl = 'https://catfact.ninja/facts?limit=300'
const dogFactsUrl = 'https://dog-api.kinduff.com/api/facts?number=100'
const catFacts = pluck('fact')(getCatFact().data)
const dogFacts = getDogFact().facts
const facts = concat(catFacts, dogFacts)

test('should fetch cat facts and dog facts and set to cache', done => {
  const catResponse = {
    json: () => Promise.resolve(getCatFact())
  }
  const dogResponse = {
    json: () => Promise.resolve(getDogFact())
  }
  const fetch = stub()
  fetch.onCall(0).returns(Promise.resolve(catResponse))
  fetch.onCall(1).returns(Promise.resolve(dogResponse))
  const Math = {
    floor: stub().returns(0),
    random: stub().returns(0)
  }
  const ctx = {
    storage: {
      get: f => f(null, null),
      set: spy()
    }
  }
  const expected = getCatFact().data[0].fact

  const cb = (err, res) => {
    expect(err).toEqual(null)
    expect(fetch.callCount).toEqual(2)
    expect(fetch.args[0][0]).toEqual(catFactsUrl)
    expect(fetch.args[1][0]).toEqual(dogFactsUrl)
    expect(Math.random.callCount).toEqual(1)
    expect(Math.floor.callCount).toEqual(1)
    expect(ctx.storage.set.args[0][0]).toEqual(facts)
    expect(ctx.storage.set.args[0][1]).toEqual({ force: 1 })
    expect(res).toEqual(expected)
    done()
  }

  return getFacts(Math, fetch, ctx, cb)
})

test('should return a fact from cache if exists in cache', done => {
  const catFacts = pluck('fact')(getCatFact().data)
  const dogFacts = getDogFact().facts
  const facts = concat(catFacts, dogFacts)
  const Math = {
    floor: stub().returns(0),
    random: stub().returns(0)
  }
  const ctx = {
    storage: {
      get: f => f(null, facts)
    }
  }
  const expected = getCatFact().data[0].fact

  const cb = (err, res) => {
    expect(Math.random.callCount).toEqual(1)
    expect(Math.floor.callCount).toEqual(1)
    expect(res).toEqual(expected)
    done()
  }
  return getFacts(Math, fetch, ctx, cb)
})

test('should catch errors if either dog facts or cat facts were unretrievable', done => {
  const fetch = stub().returns(Promise.reject('error'))
  const ctx = {
    storage: {
      get: f => f(null, null)
    }
  }
  const cb = (err, res) => {
    expect(err).toEqual('error')
    expect(fetch.callCount).toEqual(2)
    expect(fetch.args[0][0]).toEqual(catFactsUrl)
    expect(fetch.args[1][0]).toEqual(dogFactsUrl)
    done()
  }

  return getFacts({}, fetch, ctx, cb)
})

test('should return a random fact from an array', () => {
  const Math = {
    floor: stub().returns(0),
    random: stub().returns(0)
  }
  const facts = ['fact1', 'fact2']

  const actual = chooseRandomFact(Math, facts)

  expect(Math.floor.callCount).toEqual(1)
  expect(Math.random.callCount).toEqual(1)
  expect(actual).toEqual('fact1')
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
