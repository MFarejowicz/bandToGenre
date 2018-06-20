const express = require('express');
const app     = express();
const utils   = require("./utils.js");

app.use(express.static(__dirname + '/spotify'));

utils.parse('./band.csv', function(arr) {
  // utils.unparse(arr);
});


console.log('Listening on 8888');
app.listen(8888);
