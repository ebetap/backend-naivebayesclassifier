const kFold = require('./KFoldValidation')
const kFoldInstance = new kFold(10)
// console.log(kFoldInstance.splitedDataSpam.length)
// for(let i=0;i<kFoldInstance.splitedDataSpam.length;i++){
//   console.log(`Cluster ke-${i} = `,kFoldInstance.splitedDataSpam[i].length)
// }

// // console.log(kFoldInstance.splitData(kFoldInstance.dataLabeledSpam,10)[0].le)
console.log(kFoldInstance.doValidation())