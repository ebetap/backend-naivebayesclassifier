const NBC = require('./lib/NBC')

let bayesInstance = new NBC()
var notspam = [
  'Halo Apa kabar kamu?',
  'kabar baik',
  'foto dimana itu mas?;'
];

var spam = [
  'obat pembesar',
  'besar dan kencang cek instagram kami',
  'butuh peninggi badan? cek instagram kami dijamin tinggi'
];

bayesInstance.train(notspam,'notspam')
bayesInstance.train(spam,'spam')

console.log(bayesInstance)

console.log(bayesInstance.classify('butuh pembesar'))
console.log(bayesInstance.classify('kabar yang sangat baik'))
console.log(bayesInstance.classify('Halo Kamu bagaimana kabarnya'))

