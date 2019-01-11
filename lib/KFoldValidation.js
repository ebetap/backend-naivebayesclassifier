/**
 * @author Beta Priyoko
 */

const bayesModel = require('./NBC')
const spam = require('../datasets/spam/spam.json')
const notSpam = require('../datasets/notspam/notspam.json')
const emojiCleaner = require('emoji-strip')

class KFoldValidation {
  constructor(nFold){
    this.nFold = nFold

    this.emojiCleaner = emojiCleaner

    this.dataLabeledSpam = spam.message.map(komentar => {
      komentar.label = 'spam'
      return komentar
    })

    this.dataLabeledNotSpam = notSpam.message.map(komentar => {
      komentar.label = 'notspam'
      return komentar
    })
    this.splitedDataSpam = this.splitData(this.dataLabeledSpam,this.dataLabeledSpam.length/nFold)

    this.splitedDataNotSpam = this.splitData(this.dataLabeledNotSpam,this.dataLabeledNotSpam.length/nFold)

    this.accuracyEachFold = []

    this.modelAccuracy = 0
  }

  splitData(array,size){
    const chunked_arr = []
    let index = 0
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index))
      index += size
    }
    return chunked_arr
  }

  doValidation(){
    //nFold times training
    let akurasiRataRata = 0
    for(let k=0;k<this.nFold;k++) {
      let nbcInstance = new bayesModel()

      let dataTestingSpam = this.splitedDataSpam.filter((value,index,arr) => index === k)[0]
      let dataTestingNotSpam = this.splitedDataNotSpam.filter((value,index,arr) => index === k)[0]

      let dataTesting = dataTestingSpam.concat(dataTestingNotSpam)
      let dataTrainingSpam = (this.splitedDataSpam.filter((value,index,arr) => index < k || index > k)).reduce((acc,val) => acc.concat(val))
      let dataTrainingNotSpam = (this.splitedDataNotSpam.filter((value,index,arr) => index < k || index > k)).reduce((acc,val) => acc.concat(val))
      
      //Clean emoji from the data
      let cleanDataTrainingSpam = dataTrainingSpam.map(komentar => emojiCleaner(komentar.spam).normalize('NFD').normalize('NFC').normalize('NFKC').normalize('NFKD'))

      let cleanDataTrainingNotSpam = dataTrainingNotSpam.map(komentar => emojiCleaner(komentar.notspam).normalize('NFD').normalize('NFC').normalize('NFKC').normalize('NFKD'))
      
      nbcInstance.train(cleanDataTrainingSpam,'spam')
      nbcInstance.train(cleanDataTrainingNotSpam,'notspam')
 
      let benar = 0
      let Salah = 0
      let akurasiEachCluster = 0
      //do validation
      for(let iter=0;iter<dataTesting.length;iter++){
        let predictResult
        if(dataTesting[iter].label === 'spam'){
          predictResult = nbcInstance.classify(emojiCleaner(dataTesting[iter].spam).normalize('NFD').normalize('NFC').normalize('NFKC').normalize('NFKD'))
        }else if(dataTesting[iter].label === 'notspam'){
          predictResult = nbcInstance.classify(emojiCleaner(dataTesting[iter].notspam).normalize('NFD').normalize('NFC').normalize('NFKC').normalize('NFKD'))
        } 

        if(predictResult.label == dataTesting[iter].label){
          benar+=1
        }else{
          Salah+=1
        }
      }
      akurasiEachCluster = ((benar/dataTesting.length).toFixed(2))*100
      akurasiRataRata += akurasiEachCluster
      this.accuracyEachFold.push({
        fold: k+1,
        truePredictResult: benar,
        falsePredictResult: Salah,
        accuracy: akurasiEachCluster 
      })
      console.log(`Cluster ${k+1} Accuracy (${benar}/${dataTesting.length}): `,`${akurasiEachCluster}`)

      //resetInstance
      nbcInstance = null
    }

    // console.log('Akurasi Model',`${((akurasiRataRata/this.nFold)).toFixed(2)}%`)
    this.modelAccuracy = ((akurasiRataRata/this.nFold)).toFixed(2)
  }

  getResult(){
    return {
      statistic: this.accuracyEachFold,
      modelAccuracy: `${this.modelAccuracy}%`
    }
  }
}

module.exports = KFoldValidation