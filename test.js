var csv = require('./jquery.csv.js');
var fs = require('fs');

var givenArgs = process.argv.slice(2);

if (givenArgs.length > 0) {
  var fileName = givenArgs[0];
  fs.readFile(fileName, 'utf8', function (err,data) {
    if (err) {
      if (err.code == "ENOENT") {
        return console.log("No file with name: " + fileName);
      } else {
        return console.log(err);
      }
    }
    console.log(data);
    var test = csv.toArrays(data);
    console.log(test);
  });
}
