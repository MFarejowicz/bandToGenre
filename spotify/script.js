(function() {

  var stateKey = 'spotify_auth_state';
  var output = []; // This will eventually hold the resulting CSV

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  /**
   * Checks to make sure the browser supports file uploads
   * @return {boolean} Whether or not the browser supports file uploads
   */
  function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      isCompatible = true;
    }
    return isCompatible;
  }

  /**
   * Pulls the band name and genre from the response of a Spotify API call
   * @param  {string} bandName The name of the band searched for
   * @param  {Object} response The response of a Spotify API call
   * @return {Object} The generated string
   */
  function pullGenres(bandName, response){
    var artists = response.artists.items; // Pull artists from search result
    if (artists.length == 0) { // No artists found
      console.log("No artists found with search: " + bandName.split("%20").join(" "));
      return null;
    } else { // Artists found!
      var choice = artists[0]; //Naively pull first (most popular) result
      var name = choice.name;
      var genres = choice.genres;
      if (genres.length == 0) { // Artist has no associated genres
        return {name: name, genres: null}
      } else { // Artist has some associated genres
        return {name: name, genres: genres}
      }
    }
  }

  /**
   * Displays the genres of a band from an individual search.
   * @param  {string} bandName The name of the band searched for
   * @param  {Object} response The response of a Spotify API call
   */
  function buildResultIndiv(bandName, response){
    var result = pullGenres(bandName, response); // Get genre from raw API result
    if (!result) {
      $("#info").html("<span>I was not able to find a band with search: '" + bandName + "'.</span>");
    }
    else if (!result.genres) {
      $("#info").html("<span>I was able to find the band: '" + result.name + "', but it has no associated genres.</span>");
    }
    else {
      $('#info').html("<span>I was able to find the band: '" + result.name + "', which has the following genres: " + result.genres + ".</span>");
    }
  }

  /**
   * Makes a call to the Spotify API for the csv approach. After completing,
   * one call, will move on to the next row in the csv.
   * @param  {Array} data The raw data from the CSV, in 2D format.
   * @param  {int} line The current row being searched.
   */
  function makeCall(data, line){
    var outputRow = []; // Build output as we run each API call
    outputRow.push(parseInt(data[line][0]));
    var bandName = data[line][1];
    outputRow.push(bandName);
    bandName = bandName.split(" ").join("%20");
    var fullURL = urlStart + bandName + urlEnd;

    $.ajax({
        url: fullURL,
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          var result = pullGenres(bandName, response);
          if (!result) {
            outputRow.push("None");
          } else if (!result.genres) {
            console.log("Band: " + result.name + ", Genres: None");
            outputRow.push("None");
          } else {
            console.log("Band: " + result.name + ", Genres: " + result.genres);
            outputRow.push(result.genres);
          }
          output.push(outputRow);
          if (line < data.length-2) {
            // console.log(line + '/' + data.length-2);
            makeCall(data, line+1);
          } else {
            console.log(output);
            arrayToCSV(output);
          }
        },
        error: function(response) {
          outputRow.push("None");
          output.push(outputRow);
          if (line < data.length-2) {
            makeCall(data, line+1);
          }
        }
    });
  }

  /**
   * Given a 2D array, will convert to a CSV and download it
   * @param  {Array} twoDiArray The 2D array to convert
   * Note, this is currently unused!
   */
  function arrayToCSV (twoDiArray) {
    //  Modified from: http://stackoverflow.com/questions/17836273/
    //  export-javascript-data-to-csv-file-without-server-interaction
    var csvRows = [];
    for (var i = 0; i < twoDiArray.length; ++i) {
      for (var j = 0; j < twoDiArray[i].length; ++j) {
        if (!Number.isInteger(twoDiArray[i][j])) {
          twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';  // Handle elements that contain commas
        }
      }
      csvRows.push(twoDiArray[i].join(','));
    }

    var csvString = csvRows.join('\r\n');
    console.log(csvString);
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' + encodeURI(csvString);
    a.target      = '_blank';
    a.download    = 'bandsAndGenres.csv';

    document.body.appendChild(a);
    a.click();
    // Optional: Remove <a> from <body> after done
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

      oauthSource = document.getElementById('oauth-template').innerHTML,
      oauthTemplate = Handlebars.compile(oauthSource),
      oauthPlaceholder = document.getElementById('oauth');

  var params = getHashParams();

  var access_token = params.access_token,
      state = params.state,
      storedState = localStorage.getItem(stateKey);

  if (access_token && (state == null || state !== storedState)) {
    alert('There was an error during the authentication');
  } else {
    localStorage.removeItem(stateKey);
    if (access_token) {
      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);
            $('#login').hide();
            $('#loggedin').show();
          }
      });

      // My additions start here
      // Below is the format that Spotify needs for its artist API call
      var urlStart = "https://api.spotify.com/v1/search?q=";
      var urlEnd = "&type=artist";

      // MANUAL SEARCH
      $('#search').click(function() {
        var bandName = $('#inp').val(); // Gets the value of the user's search

        if (bandName != ""){
          bandName = bandName.split(" ").join("%20");
          var fullURL = urlStart + bandName + urlEnd; // Gets a full URL in Spotify's desired format

          $.ajax({
              url: fullURL,
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              success: function(response) { // On success, add result to page
                buildResultIndiv(bandName, response);
              },
              error: function(response) {
                alert("The search failed");
              }
          });
        } else {
          alert("Need a band name!")
        }
      });

      // CSV SEARCH
      $( "#analyze" ).click(function(evt) {
        if (!browserSupportFileUpload()) {
          alert('The File APIs are not fully supported in this browser!');
        } else {
          var file = $("#csvUpload")[0].files[0];
          Papa.parse(file, {
            complete: function(results) {
              var data = results.data
              if (data && data.length > 0) {
                console.log(data);
                // Begin generating 2D array for result, with new column
                output.push([data[0][0], data[0][1], "bandGenre"])
                makeCall(data, 1);
              } else {
                alert('No data to import!');
              }
            }
          });
        }
      });
    } else {
        $('#login').show();
        $('#loggedin').hide();
    }

    // This handles all Spotify login material
    document.getElementById('login-button').addEventListener('click', function() {

      var client_id = '20b76ab1a3cf492dbc513d1c99fce48e'; // Your client id
      var redirect_uri = 'http://localhost:8888'; // Your redirect uri

      var state = generateRandomString(16);

      localStorage.setItem(stateKey, state);
      var scope = 'user-read-private user-read-email';

      var url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(client_id);
      url += '&scope=' + encodeURIComponent(scope);
      url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
      url += '&state=' + encodeURIComponent(state);

      window.location = url;
    }, false);
  }
})();
