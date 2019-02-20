'use strict';

//GLOBAL VARIABLES

//football-data.org API variables
const fdApiKey = 'a2d6e538e4b746ecafde70ea5964cdb0';

const fdOptions = {
    headers: new Headers({
        "X-Auth-Token": fdApiKey})
};

// DISPLAY THE THINGS!!!

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




$(watchNewsButton);
$(watchForm);
$(getCurrentTeams);