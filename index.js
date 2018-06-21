const express = require('express');
const app     = express();
const utils   = require('./utils.js');
const bcCalls = require('./bandcamp/bcCalls.js');

app.use(express.static(__dirname + '/spotify'));

utils.parse('./band.csv', function(arr) {
  bcCalls(arr, function(newArr) {
    utils.unparse(newArr);
  });
});


console.log('Listening on 8888');
app.listen(8888);
