"use strict";

//GLOBAL VARIABLES
const fdOptions = {
  headers: new Headers({
    "X-Auth-Token": "a2d6e538e4b746ecafde70ea5964cdb0"
  })
};

// UTC DATE FORMATTER
function dateFormatter(UTC) {
  const dateFormat = "YYYY-MM-DD / hh:mma";

  return moment(UTC).format(dateFormat);
}

// DISPLAY THE THINGS!!!

function displayNextMatch(responseJson) {
  const nextMatch = jQuery.grep(responseJson.matches, function(item) {
    return item.status === "SCHEDULED";
  });

  $(".js-container").empty();

  const kickoff = dateFormatter(nextMatch[0].utcDate);

  const homeTeam = nextMatch[0].homeTeam.id;

  $(".js-container").append(`
        <section class="sub-header">
            <h1 class="match-teams">${nextMatch[0].homeTeam.name}</h1>
            <h4 class="vs">VS.</h4>
            <h1 class="match-teams">${nextMatch[0].awayTeam.name}</h1>
        </section>
        <section class="box">
            <div class="next-match-container">
                <p class="next-match"><span>Matchday:</span> ${
                  nextMatch[0].matchday
                }</p>
                <p class="next-match"><span>Kickoff:</span> ${kickoff}</p>
            </div>
            <section id="map"></section>
        </section>
    `);

  getVenue(homeTeam);
}

function displayNextMatchVenue(responseJson) {
  $(".next-match-container").append(`
        <p class="next-match"><span>Stadium:</span> ${responseJson.venue}</p>
    `);
}

function displayStats(responseJson, userTeam) {
  $(".js-container").empty();

  for (let i = 0; i < responseJson.standings[0].table.length; i++) {
    if (userTeam == responseJson.standings[0].table[i].team.id) {
      $(".js-container").append(`
                <h2>Stats</h2>
                <ul id="stats">
                    <li>League Position: ${
                      responseJson.standings[0].table[i].position
                    }</li>
                    <li>Played Games: ${
                      responseJson.standings[0].table[i].playedGames
                    }</li>
                    <li>Won Games: ${
                      responseJson.standings[0].table[i].won
                    }</li>
                    <li>Drawn Games: ${
                      responseJson.standings[0].table[i].draw
                    } </li>
                    <li>Lost Games: ${
                      responseJson.standings[0].table[i].lost
                    }</li>
                    <li>Goals For: ${
                      responseJson.standings[0].table[i].goalsFor
                    }</li>
                    <li>Goals Against: ${
                      responseJson.standings[0].table[i].goalsAgainst
                    }</li>
                    <li>Goal Difference: ${
                      responseJson.standings[0].table[i].goalDifference
                    }</li>
                </ul>
                
            `);
    }
  }
}

function displayNews(newsResponseJson) {
  $(".js-container").empty();
  $(".js-container").append(`
            <h2>News</h2>
            <ul id="news-list">
            </ul>
        `);
  for (let i = 0; i < newsResponseJson.articles.length; i++) {
    $("#news-list").append(`
            <li>
            <h3><a href="${newsResponseJson.articles[i].url}">${
      newsResponseJson.articles[i].title
    }</a></h3>
            <p>${newsResponseJson.articles[i].source.name}</p>
            <p>${newsResponseJson.articles[i].description}</p>
            </li>
        `);
  }
}

function displayTeam(responseJson) {
  //empty header and js populated section
//   $(".title").empty();
  $(".intro-container").addClass("hidden");
  $(".js-container").empty();
  //insert new h1(team name) into header
//   $(".title").append(`
//         <h1>${responseJson.name}</h1>
//     `);
  //check to see if crest url key is valid, if so insert crest into DOM section
  if (responseJson.crestUrl !== null) {
    $(".js-container").append(`
            <img class="crest" alt="selected team's crest" src="${
              responseJson.crestUrl
            }">
        `);
  } else {
    $(".js-container").append(`
      <i class="fas fa-futbol"></i>`);
  }
  //show team nav (news, stats, next match)
  $(".nav").removeClass("hidden");
  $(".nav").attr("aria-live", "polite");
}

function insertCurrentTeams(responseJson) {
  const currentTeams = [];

  for (let i = 0; i < responseJson.teams.length; i++) {
    currentTeams.push({
      name: responseJson.teams[i].name,
      id: responseJson.teams[i].id
    });
  }

  currentTeams.sort(function(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  for (let i = 0; i < currentTeams.length; i++) {
    $(".select-team").append(`
        <option value="${currentTeams[i].id}">${currentTeams[i].name}</option>
        `);
  }
}

// API CALLS
function getMap(responseJson) {
  const lat = responseJson[0].lat;
  const long = responseJson[0].lon;

  let map = L.map("map").setView([`${lat}`, `${long}`], 15);

  L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken:
        "pk.eyJ1Ijoia2Z1cXVheSIsImEiOiJjanNkdW8zMDYwYnlrNDRtZndqOW5oenh1In0.WFjTNvlgwzKZGibDz7ABZg"
    }
  ).addTo(map);

  L.marker([`${lat}`, `${long}`]).addTo(map);
}

function getVenue(homeTeam) {
  const URL = `https://api.football-data.org/v2/teams/${homeTeam}
    `;
  fetch(URL, fdOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(function(responseJson) {
      displayNextMatchVenue(responseJson);
      getVenueLocation(responseJson);
    })

    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function getVenueLocation(responseJson) {
  const apikey = "7759afc20a6964";
  const venue = responseJson.address;
  const URL = `https://eu1.locationiq.com/v1/search.php?key=${apikey}&q=${venue}&format=json`;

  fetch(URL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getMap(responseJson))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function requestNextMatch(userTeam) {
  const URL = `https://api.football-data.org/v2/teams/${userTeam}/matches`;

  fetch(URL, fdOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayNextMatch(responseJson))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function requestStats(userTeam) {
  const URL = `https://api.football-data.org/v2/competitions/2016/standings`;

  fetch(URL, fdOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayStats(responseJson, userTeam))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function requestTeamNews(userTeamName) {
  const newsapiKey = "80fc5c87ac064513a95dc5d37927c2dc";

  const URL = `https://newsapi.org/v2/everything?q=${userTeamName}&pageSize=10&language=en`;

  const options = {
    headers: new Headers({
      "X-Api-Key": newsapiKey
    })
  };

  fetch(URL, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(newsResponseJson => displayNews(newsResponseJson))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function requestTeam(userTeam) {
  const URL = `https://api.football-data.org/v2/teams/${userTeam}`;

  fetch(URL, fdOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayTeam(responseJson))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

function getCurrentTeams() {
  const URL = "https://api.football-data.org/v2/competitions/2016/teams";

  fetch(URL, fdOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => insertCurrentTeams(responseJson))
    .catch(err => {
      alert(`Something went wrong: ${err.message}`);
    });
}

// EVENT LISTENERS
function watchNextButton() {
  $("#match-button").on("click", function() {
    const userTeam = $(".js-select-team").val();
    requestNextMatch(userTeam);
  });
}

function watchStatsButton() {
  $("#stats-button").on("click", function() {
    const userTeam = $(".js-select-team").val();
    requestStats(userTeam);
  });
}

function watchNewsButton() {
  $("#news-button").on("click", function() {
    const userTeamName = $("h1").text();
    requestTeamNews(userTeamName);
  });
}

function watchForm() {
  $(".js-select-team").change(function() {
    const userTeam = $(".js-select-team").val();
    $('.header').addClass('hidden');
    requestTeam(userTeam);
  });
}

$(watchNextButton);
$(watchStatsButton);
$(watchNewsButton);
$(watchForm);
$(getCurrentTeams);
