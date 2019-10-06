const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const upload = require('express-fileupload')
const NBC = require('./lib/NBC')
const fs = require('fs')
const kFold = require('./lib/KFoldValidation')
const storeModelPath = './trained-model/trainedModel.json'
const puppeteer = require('puppeteer')

let emojiCleaner = require('emoji-strip')
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(upload())

app.post('/datasets', (req, res) => {
  if (req.files) {
    let file = req.files.file
    let filename = req.files.file.name
    if (filename.split('.')[0] === 'spam') {
      file.mv(`./datasets/spam/${filename}`, (err) => {
        if (!err) {
          res.sendStatus(200)
        }
      })
    } else if (filename.split('.')[0] === 'notspam') {
      file.mv(`./datasets/notspam/${filename}`, (err) => {
        if (!err) {
          res.sendStatus(200)
        }
      })
    }
  }
})

// .replace(/[\u0300-\u036f]/g, "")
app.post('/train', (req, res) => {
  let datasetSpam = require('./datasets/spam/spam.json')
  let datasetNotSpam = require('./datasets/notspam/notspam.json')
  let bayesInstance = new NBC()
  let notspam = datasetNotSpam.message.map(data => emojiCleaner(data.notspam))
  let spam = datasetSpam.message.map(data => emojiCleaner(data.spam))

  bayesInstance.train(notspam, 'notspam')
  bayesInstance.train(spam, 'spam')

  fs.writeFileSync(storeModelPath, JSON.stringify(bayesInstance))

  res.json({
    error: false,
    message: 'Model berhasil dilatih'
  })
})

app.post('/classify', (req, res) => {
  (async () => {
    try {
      let komentarlist = []
      let result = []
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const url = req.body.url;
      await page.goto(url)

      let dataku = []
      let lis = null
      let iterationku = 0
      let geturlImage = await page.$('.KL4Bh')
      let geturlVideo = await page.$('._5wCQW')
      for (let j = 1; j <= 25; j++) {
        console.log('Crawling Data instagram...', j)
        await page.waitForSelector('li:nth-child(2) button')
        let button = await page.$('li:nth-child(2) button')
        if (button) {
          button.click()
          lis = await page.$$('.C4VMK')
          if (lis != null) {
            dataku = lis
          }
        }
        iterationku++
      }

      if (iterationku == 25) {
        for (const li of dataku) {
          const comment = await li.$eval('span', (span) => span.textContent)
          komentarlist.push(comment)
        }
      }

      let savedModel = require(storeModelPath)
      let restoredModel = new NBC()
      restoredModel.restore(savedModel)

      for (const cl in komentarlist) {
        let predictedKomentar = restoredModel.classify(emojiCleaner(komentarlist[cl]))
        predictedKomentar.komentar = komentarlist[cl]
        result.push(predictedKomentar)
      }


      if (geturlImage != null) {
        let urlImage = await geturlImage.$eval('img', (img) => img.src)
        res.json({
          imageUrl: urlImage,
          hasilKlasifikasi: result
        })
      }

      if (geturlVideo != null) {
        let urlVideo = await geturlVideo.$eval('video', (video) => video.src)
        res.json({
          videoUrl: urlVideo,
          hasilKlasifikasi: result
        })
      }

      await browser.close()
    } catch (error) {
      console.log(error)
    }

  })()

  // let savedModel = require(storeModelPath)
  // let documentToBeClassify = emojiCleaner(req.body.komentar)
  // let restoredModel = new NBC()
  // restoredModel.restore(savedModel)

  // // result = restoredModel.classify(documentToBeClassify)

  // res.json(result)

})

app.get('/validasi', (req, res) => {
  const kFoldInstance = new kFold(10)
  kFoldInstance.doValidation()

  let validationResult = kFoldInstance.getResult()

  res.json(validationResult)
})

app.get('/', (req, res) => {
  res.send(`<h1 style="text-align:center;font-size: 45px;margin-top: 40px;">Naive Bayes API for Beta\'s Thesis</h1>`)
})

app.listen(process.env.PORT || 3000, () => console.log('listening on port 3000'));