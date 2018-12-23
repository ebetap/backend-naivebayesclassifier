const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const upload = require('express-fileupload')
const NBC = require('./lib/NBC')
const fs = require('fs')

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
  var notspam = datasetNotSpam.message.map(data => emojiCleaner(data.notspam))
  var spam = datasetSpam.message.map(data => emojiCleaner(data.spam).normalize('NFD').replace(/[\u0300-\u036f]/g, ""))

  bayesInstance.train(notspam,'notspam')
  bayesInstance.train(spam,'spam')

  fs.writeFileSync(`trained-model/trainedModel.json`,JSON.stringify(bayesInstance))

  res.json({
    error: false,
    message: 'Model berhasil dilatih'
  })
})

app.post('/classify', (req,res) => {
  
})

app.listen(3000, () => console.log('listening on port 3000'));