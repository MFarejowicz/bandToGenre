var bandcamp = require('bandcamp-scraper');

function findBestMatch(bandName, results) {
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

function makeCall(data, rowNum, BAND_COL, GENRE_COL, whenDone) {
  if (data[rowNum][GENRE_COL] == '') {
    let bandName = data[rowNum][BAND_COL];
    let params = {
      query: bandName,
      page: 1
    };

    bandcamp.search(params, function(error, searchResults) {
      if (error) {
        console.log(error);
        makeCall(data, rowNum+1, BAND_COL, GENRE_COL, whenDone);
      } else {
        let artistResults = searchResults.filter(function(el) {
          return (el.type === 'artist');
        });

        if (artistResults.length > 0) {
          let bestMatch = findBestMatch(bandName, artistResults);
          if (bestMatch){
            console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: ' + bestMatch.genre.trim());
            data[rowNum][GENRE_COL] = bestMatch.genre.trim();
          } else {
            console.log('Search: ' + bandName + ', Found: NOTHING :c');
          }
        } else {
          console.log('Search: ' + bandName + ', Found: NOTHING :c');
        }

        if (rowNum < data.length - 2) {
          makeCall(data, rowNum + 1, BAND_COL, GENRE_COL, whenDone);
        } else {
          console.log('Done with BandCamp');
          whenDone(data);
        }
      }
    });
  } else {
    makeCall(data, rowNum + 1, BAND_COL, GENRE_COL, whenDone);
  }
}

module.exports = function bcCalls(arr, callback) {
  const BAND_COL = arr[0].indexOf('bandName');
  const GENRE_COL = arr[0].indexOf('bandGenre');
  if (BAND_COL >= 0) {
    makeCall(arr, 1, BAND_COL, GENRE_COL, callback);
  }
}
