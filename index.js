const NBC = require('./lib/NBC')
const fs = require('fs')
let emojiCleaner = require('emoji-strip')
let datasetSpam = require('./dataset/spam.json')
let datasetNotSpam = require('./dataset/notspam.json')

let bayesInstance = new NBC()
var notspam = datasetNotSpam.message.map(data => emojiCleaner(data.notspam))
var spam = datasetSpam.message.map(data => emojiCleaner(data.spam).normalize('NFD').replace(/[\u0300-\u036f]/g, ""))

bayesInstance.train(notspam,'notspam')
bayesInstance.train(spam,'spam')

fs.writeFileSync(`${__dirname}/spam.json`,JSON.stringify(spam))
fs.writeFileSync(`${__dirname}/notspam.json`,JSON.stringify(notspam))

let storeTrainedDocs = `${__dirname}/trainedModel.json`

fs.writeFileSync(storeTrainedDocs,JSON.stringify(bayesInstance))
// console.log(bayesInstance)

// console.log(bayesInstance.classify(`Al masjid an Nabawi itu artinya masjid yang nabi,gak usah pake al masjid,langsung masjid aja mbak soalnya mubtada' Khobar bukan na'at man'ut.#maaf kalo ngeselin`))
// console.log(bayesInstance.classify('kabar yang sangat baik'))
console.log(bayesInstance.classify('butuh peninggi badan? cek instagram kami'))
console.log(bayesInstance.classify('gempi pasti bisa, jangan menyerah ya gempi'))
console.log(bayesInstance.classify('Dasar netizen sampah, ngasal aja kalau komentar'))
console.log(bayesInstance.classify('sedia pembesar dan peninggi badan, silahkan cek ig kami. atau wa ke nomor 083867138187'))
console.log(bayesInstance.classify('Masuk pak eko, btw kamu minggu depan ada acara nggak?'))
console.log(bayesInstance.classify('Piknik dimana itu mas? nggak ngajak-ngajak nih kamu.'))
console.log(bayesInstance.classify('Ngopi dulu, ngopi lagi, ngopi terus'))

