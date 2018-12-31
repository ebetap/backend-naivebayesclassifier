/**
 * NBC
 * @constructor
 * @desc NaiveBayesClassifier constructor
 * @author Beta Priyoko
 * @copyright 2018
 */

const nalapaStemmer = require('nalapa').word

class NBC {
  constructor(){
    this.stemmer = nalapaStemmer
    this.docs = []
    this.classFeatures = {}
    this.smoothing = 1
  }

  /**
   * 
   * @param {string} text
   * @returns {array}
   */
  tokenizeCleanAndStem(text) {
    //clean punctuations and transform into array
    text = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').split(' ')

    for(let i=0; i<text.length;i++) {
      text[i] = this.stemmer.stem(text[i])
    }

    return text
  }

  /**
   * 
   * @param {array} docs 
   * @param {string} label 
   */
  train(docs,label) {
    this.registerLabel(label)

    //STORE ALL DATA to docs
    docs.forEach((doc) => {
      this.docs.push(
        {
          label: label,
          value:this.tokenizeCleanAndStem(doc)
        }
      )
    })
    
    //GET TOKEN FREQUENCY for each label
    this.docs.map((doc) => {
      doc.value.map(token => {
        if(doc.label == label){
          this.docToFeaturesCount(token,label)
        }
      })
    })
  }

  /**
   * 
   * @param {string} label 
   */
  registerLabel(label){
    if(this.classFeatures.hasOwnProperty(label) === false){
      this.classFeatures[label] = {}
    }
  }

  /**
   * 
   * @param {string} token 
   * @param {string} label 
   */
  docToFeaturesCount(token,label){
    if(this.classFeatures[label].hasOwnProperty(token)){
      this.classFeatures[label][token] += 1
    }else{
      this.classFeatures[label][token] = 1
    }
  }

  /**
   * 
   * @param {string} documents 
   * @param {string} label 
   */
  probabilityOfClass(documents,label) {
    let totalDocByLabel = this.docs.filter((document) => document.label == label).length
    let totalAllDocs = this.docs.length
    let prior = totalDocByLabel/totalAllDocs
    let likelyhood = 0
    let result

    documents = this.tokenizeCleanAndStem(documents)
    documents.map((token) => {
      if(this.classFeatures[label].hasOwnProperty(token)){
        let p = this.classFeatures[label][token]/totalDocByLabel 
        likelyhood += p
      }else{
        let p = this.smoothing/totalDocByLabel
        likelyhood += p
      }
    })
    
    result = (prior*likelyhood)/totalAllDocs

    return result
  }

  /**
   * 
   * @param {string} doc 
   */
  classify(doc){
    let result = []
    for(let key in this.classFeatures){
      result.push(
        {
          label: key,
          probability: this.probabilityOfClass(doc,key)
        }
      )
    }

    result = result.sort((a,b) => {
      return b.probability - a.probability
    })

    return result[0]
  }

  restore(classifier){
    this.docs = classifier.docs
    this.classFeatures = classifier.classFeatures
    this.smoothing = classifier.smoothing
    this.stemmer = nalapaStemmer

    return this
  }
}

module.exports = NBC