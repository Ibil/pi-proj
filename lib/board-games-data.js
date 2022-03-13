'use strict'

const fetch = require('node-fetch')

const CLIENT_ID_BOARDGAME = process.env.BOARDGAMEATLAS_KEY

const ATLAS_API_URI = 'https://api.boardgameatlas.com/api/';
const SEARCH_ENDPOINT = ATLAS_API_URI + 'search'
const GAME_ENDPOINT = ATLAS_API_URI + 'game/'

if(!CLIENT_ID_BOARDGAME) throw Error('Board Game Key not set!')

const REQUEST_PARAM_CLIENT_ID = `client_id=${CLIENT_ID_BOARDGAME}`;

module.exports = {
    getPopularGames,
    getGameByname,
    getMechanicsDetails,
    getCategoriesDetails
}

function getPopularGames(limit){
    let urlSearch = SEARCH_ENDPOINT + `?order_by=rank&${REQUEST_PARAM_CLIENT_ID}`
    limit > 0 ? urlSearch += `&limit=${limit}` : null

    return fetch(urlSearch)
    .then(res => res.json())
    .catch(err => console.log(err.message))
}

function getGameByname(name){
    if(!name) return
    return fetch(SEARCH_ENDPOINT + `?name=${name}&${REQUEST_PARAM_CLIENT_ID}`)
    .then(res => res.json())
    .catch(err => console.log(err.message))
}

// TODO re-use code as it is mostly the same ; further parameterize the url components into constants 

function getMechanicsDetails(){
    return fetch(GAME_ENDPOINT + 'mechanics' +  `?${REQUEST_PARAM_CLIENT_ID}`)
    .then(res => res.json())
    .catch(err => console.log(err.message))
}

/**
 * 
 * @returns {Promise<JSON>}
 */
function getCategoriesDetails(){
    return fetch(GAME_ENDPOINT + 'categories' +  `?${REQUEST_PARAM_CLIENT_ID}`)
    .then(res => res.json())
    .catch(err => console.log(" OLA" +err.message))
}