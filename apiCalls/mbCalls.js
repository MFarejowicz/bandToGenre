var NB = require('nodebrainz');
var nb = new NB({userAgent:'bandToGenre/0.1.0 ( mfarejow@mit.edu )'});

function findBestMatch(bandName, results) {
  let cleanBN = bandName.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
  let el, cleanEl;

  for (let i = 0; i < results.length; i++) {
    el = results[i];
    cleanEl = el.name.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();

    if (cleanBN === cleanEl) {
      return el;
    }
  }
  return null;
}

function extractGenres(tags) {
  let genres = [];
  let el;
  for (let i = 0; i < tags.length; i++) {
    el = tags[i];
    if (el.count > 0) {
      genres.push(el.name);
    }
  }
  return genres;
}

function makeCall(data, rowNum, BAND_COL, GENRE_COL, whenDone) {
  if (data[rowNum][GENRE_COL] == '') {
    let bandName = data[rowNum][BAND_COL];

    nb.search('artist', {artist: bandName, country: 'US'}, function(err, response){
      if (err) {
        console.log(err);
        setTimeout(function() { makeCall(data, rowNum + 1, BAND_COL, GENRE_COL, whenDone); }, 1000);
      } else {
        let artistResults = response.artists;
        if (artistResults.length > 0) {
          let bestMatch = findBestMatch(bandName, artistResults);
          if (bestMatch){
            if (bestMatch.tags) {
              let genres = extractGenres(bestMatch.tags);
              console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: ' + genres);
              data[rowNum][GENRE_COL] = genres;
            } else {
              console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: NONE :c');
            }
          } else {
            console.log('Search: ' + bandName + ', Found: NOTHING :c');
          }
        } else {
          console.log('Search: ' + bandName + ', Found: NOTHING :c');
        }

        if (rowNum < data.length - 2) {
          setTimeout(function() { makeCall(data, rowNum + 1, BAND_COL, GENRE_COL, whenDone); }, 1000);
        } else {
          console.log('Done with MusicBrainz');
          whenDone(data);
        }
      }
    });
  } else {
    makeCall(data, rowNum + 1, BAND_COL, GENRE_COL, whenDone);
  }
}

module.exports = function mbCalls(arr, callback) {
  const BAND_COL = arr[0].indexOf('bandName');
  const GENRE_COL = arr[0].indexOf('bandGenre');
  if (BAND_COL >= 0) {
    makeCall(arr, 19, BAND_COL, GENRE_COL, callback);
  }
}
