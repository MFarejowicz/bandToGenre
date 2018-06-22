const express = require('express');
const app     = express();
const utils   = require('./utils.js');
const spotCalls = require('./apiCalls/spotCalls.js');
const bcCalls = require('./apiCalls/bcCalls.js');
const mbCalls = require('./apiCalls/mbCalls.js');


utils.parse('./band.csv', function(arr) {
  spotCalls(arr, function(arrAfterSpot) {
    bcCalls(arrAfterSpot, function(arrAfterBc) {
      mbCalls(arrAfterBc, function(lastArr) {
        utils.unparse(lastArr);
      });
    });
  });
  // bcCalls(arr, function(newArr) {
  //   utils.unparse(newArr);
  // });

  // mbCalls(arr, function(newArr) {
  //   utils.unparse(newArr);
  // });
});


console.log('Listening on 8888');
app.listen(8888);
