const Papa = require('papaparse');
var fs = require('fs');

/**
 * Given the name of a CSV file, parses that file into a 2D array. Requires a
 * callback that will take the data and then work with it.
 * @param {file} string The name of the file to parse
 * @param {callback} function The callback function which takes 1 parameter,
 * the resulting 2D array, to be used in further work.
 * @param {outputJSON} boolean set to 'true' if JSON output is desired,
 * otherwise results in a 2D array.
 */
function parse(file, callback, outputJSON=false) {
  fs.readFile(file, 'utf8', function(err, fsOutput) {
    if (err) throw err;
    Papa.parse(fsOutput, {
      header: outputJSON,
      complete: function(results) {
        callback(results.data)
      }
    });
  });
}

/**
 * Given a 2D array, will unparse that array into a string representing a csv,
 * and then download it to your computer.
 * @param {arr} array The 2D array to unparse into a csv
 */
function unparse(arr) {
  var csvData = Papa.unparse(arr);
  fs.writeFile('newData.csv', csvData, 'utf8', function (err) {
    if (err) {
      throw err;
    } else {
      console.log("File saved");
    }
  });
}

module.exports = {
   parse,
   unparse
}
