'use strict';

//GLOBAL VARIABLES

//football-data.org API variables
const fdApiKey = 'a2d6e538e4b746ecafde70ea5964cdb0';

const fdOptions = {
    headers: new Headers({
        "X-Auth-Token": fdApiKey})
};

//insert current teams into form 
function insertCurrentTeams(responseJson) {
    for(let i = 0; i < responseJson.teams.length; i++) {
        $('.select-team').append(`
        <option value="${responseJson.teams[i].id}">${responseJson.teams[i].name}</option>
        `)
    }
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

function watchForm() {
//listen for submit event, on submit - prevent default, define variable for selected team, call requestTeam function with parameter of selected team 
    $('.form').submit(e => {
        e.preventDefault();
        const userTeam = $('.js-select-team').val();
        console.log(userTeam);
        requestTeam(userTeam);
        })
}

$(watchForm);
$(getCurrentTeams);