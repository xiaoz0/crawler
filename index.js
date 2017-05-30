const data = require('./public/data');
const moment = require('moment');
const fs = require('fs')
data.forEach((item) => {
  console.log(item.title);
})

console.log(Date.now())

console.log(moment(Date.now()).format('YYYY-MM-DD'));

console.log(fs.existsSync('./public/abd.js'))
