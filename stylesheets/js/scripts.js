var fadeInDuration = 800;
  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      justDoIt();
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      resetContent();
    }
  }
  function resetContent() {
      document.getElementById('status').innerHTML = 'Please Log in via Facebook or type the artist name to find out!';
      $("#all_results").text("");
      $('#kitty').attr("src","/stylesheets/img/guitarist-cat_2.png");
      $('#kitty').fadeIn(fadeInDuration);
      info("What are you waiting for?");
      $('#fb_logout_button').removeClass('shown').addClass('hidden');
      $('#fb_login_button').removeClass('hidden').addClass('shown');
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '1628984117338276',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2',// use version 2.2
    status     : true
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  function logOutApp() {
    resetContent();
    FB.logout(function(response) {      
    });
  }

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function justDoIt() {
    var musicList;
    $('#fb_logout_button').removeClass('hidden').addClass('shown');
    $('#fb_login_button').removeClass('shown').addClass('hidden');
    console.log('Welcome!  Fetching your information.... ');
    /* make the API call */
    FB.api('/me', function(response) {
        console.log(response);
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Whazzup, ' + response.name + '?';
    });
    FB.api(
        "/me/music",
        function (response) {
          if (response && !response.error) {
                var musicList = parseData(response.data);
                if (musicList.length == 0) {
                    info("Wow! You haven't liked any musicians yet. Go to your Facebook page and do it!");
                    $('#kitty').attr("src","/stylesheets/img/grumpy_cat.jpg");
                    $("#all_results").text("");
                    $('#kitty').fadeIn(fadeInDuration);
                } else {
                    addNewArtists(musicList);
                    $('#kitty').attr("src","/stylesheets/img/guitarist-cat_2.png");
                }
          } else {
                info("Something went wrong while getting music list");
                console.log(response);
          }
        })
  }

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));


jQuery.ajaxSettings.traditional = true; 
var config = getConfig();
function fetchSimilarArtists(artist, callback) {
    var url = config.echoNestHost + 'api/v4/artist/similar';
    $("#all_results").empty();
    info("Getting similar artists ...");
    $.getJSON(url, { 
            'api_key': config.apiKey,
            'id' : artist.id,
            'bucket': [ 'id:' + config.spotifySpace], 
            'limit' : true,
          }) 
        .done(function(data) {
            info("");
            if (data.response.status.code == 0 && data.response.artists.length > 0) {
                callback(data.response.artists);
            } else {
                info("No similars for " + artist.name);
            }
        })
        .error( function() {
            info("Whoops, had some trouble getting that playlist");
        }) ;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function parseData(musicList){
  shuffle(musicList);
  var artists = [];
      for (i = 0; i < Math.min(musicList.length, 5); i++) {
          artists.push(musicList[i].name);
      }
  return artists;
}
function fetchSpotifyImagesForArtists(artists, callback) {
    info("Fetching spotify images for artists ...");
    console.log('fetchSpotifyImagesForArtists');
    var fids = [];
    artists.forEach(function(artist) {
        fids.push(fidToSpid(artist.foreign_ids[0].foreign_id));
    });
    $.getJSON("https://api.spotify.com/v1/artists/", { 'ids': fids.join(',')}) 
        .done(function(data) {
            data.artists.forEach(function(sartist, which) {
                artists[which].spotifyArtistInfo = sartist;
            });
            callback(artists);
        })
        .error( function() {
            info("Whoops, had some trouble getting that playlist");
        }) ;
}
function showArtists(seeds, similars) {
    info("");
    console.log('show artists', seeds, similars);
    showSimilars(seeds, similars);
}
function showSimilars(seeds, similars) {
    var div = $("<div>");
    console.log('showing similars for seeds : ')
    console.log(seeds);
    div.append($("<h2>").text("Artists Similar to " + seeds));
    div.addClass('similars');
    similars.forEach(function(similar) {
        var simDiv = getArtistDiv(similar);
        if (simDiv) {
            div.append(simDiv);
        }
    });
    $("#all_results").hide();
    $("#all_results").append(div);
    $("#all_results").fadeIn(600);
}
function getArtistDiv(artist) {
    var image = getBestImage(artist.spotifyArtistInfo.images, 600);
    if (image) {
        var adiv = $("<div>");
        adiv.addClass('artist');
        adiv.append($("<h3 class='artist_name'>").text(artist.name));
        var img = $("<img class='artist_image' title='Click to find artists similar to " + artist.name + "'>");
        img.attr('src', image.url);
        adiv.append(img);
        img.on('click', function() {
            $("#artist").val(artist.name);
            fetchSimilarArtists(artist, function(similars) {
                fetchSpotifyImagesForArtists(similars, function(similars) {
                    showArtists(artist.name, similars);
                });
            });
        });
        return adiv;
    } else {
        return null;
    }
}
function getBestImage(images, minSize) {
    var best = null;
    if (images.length > 0) {
        best = images[0];
        images.forEach(
            function(image) {
                if (image.width >= minSize) {
                    best = image;
                }
            }
        );
    }
    return best;
}
function searchArtist(names, callback) {
    var url = config.echoNestHost + 'api/v4/artist/similar';
    $("#all_results").empty();
    info("Searching for artists ...");
    $.getJSON(url, {
            'api_key': config.apiKey,
            'name' : names,
            'bucket': [ 'id:' + config.spotifySpace], 
            'limit' : true,
          }) 
        .done(function(data) {
            info("");
            console.log(data);
            callback(data);
        })
        .error( function() {
            info("Whoops, had some trouble finding that artist");
        }) ;
}
function addNewArtists(artists) {
    $("#all_results").text("");
    $('#kitty').hide();
    console.log('searching for', artists);
    searchArtist(artists, function(data) {
        console.log('search', data);
        if (data.response.status.code == 0 && data.response.artists.length > 0) {
            newArtists = data.response.artists;
            fetchSpotifyImagesForArtists(data.response.artists, function(seeds) {
                        showArtists(artists, newArtists);
            });
        } else {
            info("Can't find that artist");
        }
    });
}
function getConfig() {
    return {
        apiKey: "ECLJI0GPBJVEXSZDT",
        spotifySpace: "spotify",
        echoNestHost: "http://developer.echonest.com/"
    };
}
function fidToSpid(fid) {
    var fields = fid.split(':');
    return fields[fields.length - 1];
}
function info(txt) {
    $("#info").text(txt);
}


//Back to top button script
$(document).ready(function() {
    var offset = 250;
    var duration = 400;
    $('#kitty').hide();
    resetContent();
    $('.back-to-top').hide();
    $(window).scroll(function() {
        if ($(this).scrollTop() > offset) {
            $('.back-to-top').fadeIn(fadeInDuration);
        } else {
            $('.back-to-top').fadeOut(fadeInDuration);
        }
    });
    $("#artist").on('keydown', function(evt) {
        if (evt.keyCode == 13) {
            addNewArtists($("#artist").val());
        }
    });

    $("#go").on("click", function() {
        addNewArtists($("#artist").val());
    });
    $('.back-to-top').click(function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, duration);
        return false;
    })
});