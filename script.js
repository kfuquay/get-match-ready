'use strict';

//GLOBAL VARIABLES

//football-data.org API variables
const fdApiKey = 'a2d6e538e4b746ecafde70ea5964cdb0';

const fdOptions = {
    headers: new Headers({
        "X-Auth-Token": fdApiKey})
};

// DISPLAY THE THINGS!!!

function displayNextMatch(responseJson) {

    const nextMatch = jQuery.grep(responseJson.matches, function(item) {
        return(item.status === 'SCHEDULED');
    });

    $('.js-container').empty();

    $('.js-container').append(`
        <section class="sub-header">
            <h1 class="match-teams">${nextMatch[0].homeTeam.name}</h1>
            <h4 class="vs">VS.</h4>
            <h1 class="match-teams">${nextMatch[0].awayTeam.name}</h1>
        </section>

        <section class="next-match-container">
            <p class="next-match"><span>Matchday:</span> ${nextMatch[0].matchday}</p>
            <p class="next-match"><span>Kickoff:</span> ${nextMatch[0].utcDate}</p>
            <p class="next-match"><span>At:</span> ${nextMatch[0].homeTeam.name}</p>
        </section>


    `)

}

function displayStats(responseJson, userTeam) {

    $('.js-container').empty();

    for (let i=0; i < responseJson.standings[0].table.length; i++) {
        if (userTeam == responseJson.standings[0].table[i].team.id) {
            $('.js-container').append(`
                <h2>STATS</h2>
                
                <ul id="stats">
                    <li>League Position: ${responseJson.standings[0].table[i].position}</li>
                    <li>Played Games: ${responseJson.standings[0].table[i].playedGames}</li>
                    <li>Won Games: ${responseJson.standings[0].table[i].won}</li>
                    <li>Drawn Games: ${responseJson.standings[0].table[i].draw} </li>
                    <li>Lost Games: ${responseJson.standings[0].table[i].lost}</li>
                    <li>Goals For: ${responseJson.standings[0].table[i].goalsFor}</li>
                    <li>Goals Against: ${responseJson.standings[0].table[i].goalsAgainst}</li>
                    <li>Goal Difference: ${responseJson.standings[0].table[i].goalDifference}</li>
                </ul>
                
            `)

        }
    }
}

function displayNews(newsResponseJson) {

    $('.js-container').empty();
    $('.js-container').append(`
            <h2>Recent News</h2>
            <ul id="news-list">
            </ul>
        `)
    for (let i=0; i < newsResponseJson.articles.length; i++) {
        $('#news-list').append(`
            <li>
            <h3><a href="${newsResponseJson.articles[i].url}">${newsResponseJson.articles[i].title}</a></h3>
            <p>${newsResponseJson.articles[i].source.name}</p>
            <p>${newsResponseJson.articles[i].description}</p>
            </li>
        `)
    }
}

function displayTeam(responseJson) {
    
    //empty header and js populated section
    $('.title').empty();
    $('.intro-container').addClass('hidden');
    $('.js-container').empty();
    //insert new h1(team name) into header
    $('.title').append(`
        <h1>${responseJson.name}</h1>
    `);
    //check to see if crest url key is valid, if so insert crest into DOM section
    if (responseJson.crestUrl !== null) {
        $('.js-container').append(`
            <img class="crest" alt="selected team's crest" src="${responseJson.crestUrl}">
        `)
    }
    //show team nav (news, stats, next match)
    $('.nav').removeClass('hidden');
}

function insertCurrentTeams(responseJson) {
    for(let i = 0; i < responseJson.teams.length; i++) {
        $('.select-team').append(`
        <option value="${responseJson.teams[i].id}">${responseJson.teams[i].name}</option>
        `)
    }
}


// API CALLS

function requestNextMatch(userTeam) {

    const URL = `https://api.football-data.org/v2/teams/${userTeam}/matches`

    fetch(URL, fdOptions)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayNextMatch(responseJson))
        .catch(err => {
            alert(`Something went wrong: ${err.message}`);
        })
}

function requestStats(userTeam) {
    
    const URL = `https://api.football-data.org/v2/competitions/2016/standings`

    fetch(URL, fdOptions)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error (response.statusText);
    })
    .then(responseJson => displayStats(responseJson, userTeam))
    .catch(err => {
        alert(`Something went wrong: ${err.message}`);
    })
}

function requestTeamNews(userTeamName) {

    const newsapiKey = '80fc5c87ac064513a95dc5d37927c2dc';

    const URL = `https://newsapi.org/v2/everything?q=${userTeamName}&pageSize=10&language=en`;

    const options = {
        headers: new Headers({
            'X-Api-Key': newsapiKey
        })
    };

    fetch(URL, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error (response.statusText);
        })
        .then(newsResponseJson => displayNews(newsResponseJson))
        .catch(err => {
            alert(`Something went wrong: ${err.message}`);
        });
    
}

function requestTeam(userTeam) {

    const URL = `https://api.football-data.org/v2/teams/${userTeam}`

    fetch(URL, fdOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error (response.statusText);
        })
        .then(responseJson => displayTeam(responseJson))
        .catch(err => {
            alert(`Something went wrong: ${err.message}`);
        })
}

function getCurrentTeams() {
    const URL = 'https://api.football-data.org/v2/competitions/2016/teams'

    fetch(URL, fdOptions)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => insertCurrentTeams(responseJson))
        .catch(err => {
            alert(`Something went wrong: ${err.message}`);
        })
}


// EVENT LISTENERS
function watchNextButton() {
    $('#match-button').on('click', function() {
        const userTeam = $('.js-select-team').val();
        requestNextMatch(userTeam);
    })
}

function watchStatsButton() {
    $('#stats-button').on('click', function () {
        const userTeam = $('.js-select-team').val();
        requestStats(userTeam);
    })
}

function watchNewsButton() {
    $('#news-button').on('click', function () {
        const userTeamName = $('h1').text();
        requestTeamNews(userTeamName);
    })
}

function watchForm() {
//listen for submit event, on submit - prevent default, define variable for selected team, call requestTeam function with parameter of selected team 
    $('.form').submit(e => {
        e.preventDefault();
        const userTeam = $('.js-select-team').val();
        console.log(userTeam);
        requestTeam(userTeam);
        })
}


$(watchNextButton);
$(watchStatsButton);
$(watchNewsButton);
$(watchForm);
$(getCurrentTeams);