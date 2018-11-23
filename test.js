var fs = require('fs');
var path = require('path');
var readStream = fs.createReadStream('wordtotal', 'utf8');
let data = ''
readStream.on('data', function(chunk) {
    data += chunk;
}).on('end', function() {
    console.log(data);
})