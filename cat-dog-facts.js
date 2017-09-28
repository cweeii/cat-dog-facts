require('fetch-everywhere')
const { pluck, concat } = require('ramda')

const catFactsUrl = 'https://catfact.ninja/facts?limit=300'
const dogFactsUrl = 'https://dog-api.kinduff.com/api/facts?number=100'

const chooseRandomFact = (Math, allTheFacts) => {
  const randomFactIndex = Math.floor(Math.random() * allTheFacts.length)
  return allTheFacts[randomFactIndex]
}

const getFacts = (Math, fetch, ctx, cb) => {
  ctx.storage.get((err, data) => {
    if (data) return cb(null, chooseRandomFact(Math, data))

    const catPromise = fetch(catFactsUrl)
    const dogPromise = fetch(dogFactsUrl)

    return Promise.all([catPromise, dogPromise])
      .then(([catResponse, dogResponse]) => {
        return Promise.all([catResponse.json(), dogResponse.json()])
      })
      .then(([catResult, dogResult]) => {
        const catFacts = pluck('fact')(catResult.data)
        const dogFacts = dogResult.facts

        const allTheFacts = concat(catFacts, dogFacts)
        const randomFact = chooseRandomFact(Math, allTheFacts)
        cb(null, randomFact)
      })
      .catch(e => {
        cb(e)
      })
  })
}

module.exports = (ctx, cb) => {
  getFacts(Math, fetch, ctx, cb)
}

module.exports.chooseRandomFact = chooseRandomFact
module.exports.getFacts = getFacts
