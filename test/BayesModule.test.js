const BayesModule = require('../lib/NBC')

describe('Naive Bayes Classifier Module',() => {
  it('Harus bisa membuat instance dari NBC',(done) => {
    let myInstance = new BayesModule()

    if(typeof myInstance === 'object') {
      done()
    }else{
      done(new Error('Not passed test.'))
    }
  })

  it('Method tokenizeAndStem harus return Array',(done) => {
    let myInstance = new BayesModule()

    if(Array.isArray(myInstance.tokenizeCleanAndStem('menggunakan'))) {
      done()
    }else{
      done(new Error(`Failed, its return ${typeof myInstance.tokenizeCleanAndStem('menggunakan')}`))
    }
  })
})