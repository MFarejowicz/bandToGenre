var SpotifyWebApi = require('spotify-web-api-node');

var clientId = '20b76ab1a3cf492dbc513d1c99fce48e',
    clientSecret = 'b832439642a34bbc9e9ce51059fc7f6c';

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

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

function makeCall(data, rowNum, BAND_COL, whenDone) {
  let bandName = data[rowNum][BAND_COL];
  spotifyApi.searchArtists(bandName)
  .then(function(response) {
    let artistResults = response.body.artists.items;
    if (artistResults.length > 0) {
      let bestMatch = findBestMatch(bandName, artistResults);
      if (bestMatch){
        if (bestMatch.genres.length > 0) {
          console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: ' + bestMatch.genres);
          data[rowNum].push(bestMatch.genres);
        } else {
          console.log('Search: ' + bandName + ', Found: ' + bestMatch.name.trim() + ', Genre: NONE :c');
          data[rowNum].push('');
        }
      } else {
        console.log('Search: ' + bandName + ', Found: NOTHING :c');
        data[rowNum].push('');
      }
    } else {
      console.log('Search: ' + bandName + ', Found: NOTHING :c');
      data[rowNum].push('');
    }

    if (rowNum < data.length - 2) {
      makeCall(data, rowNum + 1, BAND_COL, whenDone);
    } else {
      console.log('Done with Spotify');
      data[0].push('bandGenre')
      whenDone(data);
    }
  }, function(err) {
    console.error(err);
    if (err.statusCode === 502) {
      makeCall(data, rowNum, BAND_COL, whenDone);
    } else {
      makeCall(data, rowNum + 1, BAND_COL, whenDone);
    }
  });
}

module.exports = function spotCalls(arr, callback) {
  // Retrieve an access token.
  spotifyApi.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);

      const BAND_COL = arr[0].indexOf('bandName');
      if (BAND_COL >= 0) {
        makeCall(arr, 1, BAND_COL, callback);
      }
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token', err);
    }
  );
}
