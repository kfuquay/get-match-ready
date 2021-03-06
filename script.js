"use strict";

//GLOBAL VARIABLES/STATE
const fdOptions = {
  headers: new Headers({
    "X-Auth-Token": "a2d6e538e4b746ecafde70ea5964cdb0"
  })
};

// UTC DATE FORMATTER
//converts utc formatted date response to more readable format
function dateFormatter(UTC) {
  const dateFormat = "YYYY-MM-DD / hh:mma";

  return moment(UTC).format(dateFormat);
}

// RENDER/DISPLAY
//finds next scheduled match for user selected team sends utc date to dateFormatter function, empties container, populates container with info about next match, sends id of homeTeam to getVenue function
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

//displays stadium name for user selected team's next match (takes response from getVenue as param)
function displayNextMatchVenue(responseJson) {
  $(".next-match-container").append(`
        <p class="next-match"><span>Stadium:</span> ${responseJson.venue}</p>
    `);
}

//empties container, displays results from requestStats function
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
              <li>Won Games: ${responseJson.standings[0].table[i].won}</li>
              <li>Drawn Games: ${responseJson.standings[0].table[i].draw} </li>
              <li>Lost Games: ${responseJson.standings[0].table[i].lost}</li>
              <li>Goals For: ${responseJson.standings[0].table[i].goalsFor}</li>
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

//empties container, populates with results from news API
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

//hides intro paragraph, empties container, displays user selected team's crest or if crest url is invalid displays football image/logo, displays nav with ARIA-live attribute of 'polite'
function displayTeam(responseJson) {
  $(".intro-container").addClass("hidden");
  $(".js-container").empty();

  if (
    responseJson.crestUrl !== null &&
    responseJson.tla !== "BRI" &&
    responseJson.tla !== "WBA" &&
    responseJson.tla !== "HUL"
  ) {
    $(".js-container").append(`
            <img class="crest" alt="selected team's crest" src="${
              responseJson.crestUrl
            }">
        `);
  } else {
    $(".js-container").append(`
      <i class="fas fa-futbol"></i>`);
  }
  //display nav
  $(".nav").removeClass("hidden");
  $(".nav").attr("aria-live", "polite");
}

//inserts teams competing in current season of Championship league as options in select dropdown element(sorted alphabetically)
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
//get map to display - takes response from getVenueLocation as param
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

//get lat and long of venue/stadium(takes venue address as param) - send response to getMap function
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

//get venue of user selected team's next match - send response to displayNextMatchVenue and getVenueLocation
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

//get info about user selected team's next match - send response to displayNextMatch function
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

//get current seasons stats for user selected team - send response to displayStats function
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

//get news about user selected team - send response to displayNews function
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

//get info about user selected team - send response to displayTeam function
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

//get list of teams competing in Championship league for current season - send response to insertCurrentTeams function
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
    requestTeam(userTeam);
  });
}

function init() {
  $(watchNextButton);
  $(watchStatsButton);
  $(watchNewsButton);
  $(watchForm);
  $(getCurrentTeams);
}

$(init);
