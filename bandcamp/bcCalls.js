var bandcamp = require('bandcamp-scraper');

function findBestMatch(bandName, results) {
  let counter = 0;
  let cleanBN = bandName.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
  let el, cleanEl;

  for (let i = 0; i < results.length; i++) {
    el = results[i];
    cleanEl = el.name.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
    // if (el.location.toLowerCase().includes('boston')) {
    //   return el;
    // } else if (el.location.toLowerCase().includes('mass')) {
    //   return el;
    if (cleanBN === cleanEl) {
      return el;
    }
  }
  return null;
}

function makeCall(data, rowNum, BAND_COL, whenDone) {
  let bandName = data[rowNum][BAND_COL];
  let params = {
    query: bandName,
    page: 1
  };

  bandcamp.search(params, function(error, searchResults) {
    if (error) {
      console.log(error);
    } else {
      artistResults = searchResults.filter(function(el) {
        return (el.type === 'artist');
      });

      if (artistResults.length > 0) {
        let bestMatch = findBestMatch(bandName, artistResults);
        if (bestMatch){
          console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: ' + bestMatch.genre.trim());
          data[rowNum].push(bestMatch.genre.trim());
        } else {
          console.log('Search: ' + bandName + ', Found: NOTHING :c');
          data[rowNum].push('');
        }
      } else {
        console.log('Search: ' + bandName + ', Found: NOTHING :c');
        data[rowNum].push('');
      }

      if (rowNum < data.length - 1) {
        makeCall(data, rowNum + 1, BAND_COL, whenDone);
      } else {
        console.log('Done');
        data[0].push('bandGenre')
        whenDone(data);
      }
    }
  });
}

module.exports = function bcCalls(arr, callback) {
  const BAND_COL = arr[0].indexOf('bandName');
  if (BAND_COL >= 0) {
    makeCall(arr, 1, BAND_COL, callback);
  }
}
