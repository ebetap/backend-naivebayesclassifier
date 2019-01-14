const kFold = require('./KFoldValidation')
const kFoldInstance = new kFold(10)
console.log(kFoldInstance.doValidation())
console.log(kFoldInstance.getResult())