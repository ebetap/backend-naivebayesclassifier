const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const upload = require('express-fileupload')
const NBC = require('./lib/NBC')
const fs = require('fs')
const kFold =require('./lib/KFoldValidation')
const storeModelPath = './trained-model/trainedModel.json'

let emojiCleaner = require('emoji-strip')
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(upload())

app.post('/datasets',(req,res) => {
  if(req.files){
    let file = req.files.file
    let filename = req.files.file.name
    if(filename.split('.')[0] === 'spam'){
      file.mv(`./datasets/spam/${filename}`,(err) => {
        if(!err){
          res.sendStatus(200)
        }
      })
    }else if(filename.split('.')[0] === 'notspam'){
      file.mv(`./datasets/notspam/${filename}`,(err) => {
        if(!err){
          res.sendStatus(200)
        }
      })
    }
  }
})

app.post('/train',(req,res) => {
  let datasetSpam = require('./datasets/spam/spam.json')
  let datasetNotSpam = require('./datasets/notspam/notspam.json')
  let bayesInstance = new NBC()
  let notspam = datasetNotSpam.message.map(data => emojiCleaner(data.notspam))
  let spam = datasetSpam.message.map(data => emojiCleaner(data.spam).normalize('NFD').replace(/[\u0300-\u036f]/g, ""))

  bayesInstance.train(notspam,'notspam')
  bayesInstance.train(spam,'spam')

  fs.writeFileSync(storeModelPath,JSON.stringify(bayesInstance))

  res.json({
    error: false,
    message: 'Model berhasil dilatih'
  })
})

app.post('/classify', (req,res) => {
  let result
  let savedModel = require(storeModelPath)
  let documentToBeClassify = emojiCleaner(req.body.komentar).normalize('NFD').replace(/[\u0300-\u036f]/g, "")
  let restoredModel = new NBC()
  restoredModel.restore(savedModel)

  result = restoredModel.classify(documentToBeClassify)

  res.json(result)
})

app.get('/validasi',(req,res) => {
  const kFoldInstance = new kFold(10)
  kFoldInstance.doValidation()

  let validationResult = kFoldInstance.getResult()

  res.json(validationResult)
})

app.get('/', (req,res) => {
  res.send(`<h1 style="text-align:center;font-size: 45px;margin-top: 40px;">Naive Bayes API for Beta\'s Thesis</h1>`)
})

app.listen(process.env.PORT || 3000, () => console.log('listening on port 3000'));