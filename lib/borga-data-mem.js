'use strict'
const fs = require('fs/promises')
const crypto = require('crypto');
const { groupCollapsed, group } = require('console');

const DEFAULT_PATH = './data/'

let dataPath = DEFAULT_PATH

const users = []; // TODO consider a set or dictionary for faster gets

let groups = []; // TODO consider a set or dictionary for faster gets

let games = []; // TODO consider a set or dictionary for faster gets

module.exports = {
    addMockGame,
    getMostPopularGames,
    searchGameByName,
    getAllGroups,
    createUser,
    createGroup,
    getGroupDetails,
    isUserValid,
    editGroup,
    deleteGroup,
    addGame,
    removeGame,
    createDummyUser
}

/** Tests only : aux function to add mock game data */
function addMockGame(name, rank){
    games.push({name : name, rank: rank})
}

/**
 * Tests only
 * Get the list of the most popular games  
 * @returns {Promise<Array>} most popular games
 */
function getMostPopularGames(limit){
    let popularGames = games?.filter(game => {
        return game.rank >= limit
    })
    return popularGames
}

/**
 * tests only
 * Search for games that match a given name
 * @param {{String}} name 
 * @returns {Promise<Array>} games
 */

function searchGameByName(name){
    let gameResults = games?.filter(game => {
        return game.name === name
    })
    return gameResults
}

// ###############################################################################################33

/**
 *  Get all groups from User
 * @param {String} bearerToken 
 * @returns {Promise<Array>} getAllGroups
 */
function getAllGroups(bearerToken) {
    let allGroups = groups?.filter(group => {
        return group.bearerToken === bearerToken
    })

    return allGroups;
}

/**
 *  Edit group from User
 * @param {String} id 
 * @param {String} name 
 * @param {String} description 
 * @param {String} bearerToken 
 * @returns {Promise<JSON>} editGroup
 */
function editGroup(id,name,description,bearerToken){
    let desiredGroup = groups.find(group => group.id === id && group.bearerToken === bearerToken);
    if(!desiredGroup || desiredGroup.length == 0) return null
    desiredGroup.name = name;
    desiredGroup.description = description;
    return id
}
/**
 * Delete group from User
 * @param {String} id 
 * @param {String} bearerToken 
 * @returns {Promise<string>} deleteGroup
 */

function deleteGroup(id,bearerToken){
    let filtered = groups.filter(elem =>{
        return (elem.id !== id && elem.bearerToken === bearerToken) || elem.bearerToken !== bearerToken
    });
    groups = filtered;
    return id 
}

/**
 * Helper function to populate data with a test user for webapp usage
 * @returns {Promise<String>} Promise with user Bearer Token
 */
 function createDummyUser(bearerToken){
    const newUser = {
        bearerToken: bearerToken
    }
    users.push(newUser);
    return Promise.resolve(newUser.bearerToken);
}

/**
 * Creates a User
 * @returns {Promise<String>} Promise with user Bearer Token
 */
function createUser(){
    const newUser = {
        bearerToken: crypto.randomUUID()
    }
    users.push(newUser);
    return Promise.resolve(newUser.bearerToken);
}

/**
 *  Creates a User Group
 * @param {String} bearerToken 
 * @param {String} name
 * @param {String} description 
 * @returns {Promise<string>} groupId
 */
 function createGroup(bearerToken, name, description){
     const newGroupId = crypto.randomUUID();
    const newGroup = {
        id: newGroupId,
        bearerToken: bearerToken,
        name: name,
        description: description,
        games: []
    }
    groups.push(newGroup);
    return Promise.resolve(newGroupId);  // TODO this resolve is unnecessary
}

/**
 *  gets a group details
 * @param {String} bearerToken 
 * @param {String} groupId
 * @returns {Promise<JSON>} groupDetails
 */
 function getGroupDetails(bearerToken, groupId){
    const desiredGroup = groups.filter(group => group.id == groupId);
    return desiredGroup.length == 0 ? {} : desiredGroup[0];
}

/**
 *  add a game to a group
 * @param {String} bearerToken 
 * @param {String} groupId
 * @param {String} gameId
 * @param {String} gameName
 * @returns {Promise<String>} 
 */
 function addGame(bearerToken, groupId, gameId, gameName){
    const desiredGroup = groups.filter(group => group.id == groupId);
    if(desiredGroup.length == 0){
        return Promise.reject( new Error("The group does not exist"));
    }
    else{
        desiredGroup[0].games.push({
           gameId : gameId,
           gameName : gameName 
        })
    }
    return Promise.resolve("OK");
}

/**
 *  remove a game from a group
 * @param {String} bearerToken 
 * @param {String} groupId
 * @param {String} gameId
 * @param {String} gameName
 * @returns {Promise<String>} 
 */
function removeGame(bearerToken, groupId, gameId){
    const desiredGroup = groups.filter(group => group.id == groupId);
    if(desiredGroup.length == 0){
        return Promise.reject(new Error("The group does not exist"));
    }
    else{
        const filteredGames = desiredGroup[0].games.filter(game => game.gameId != gameId);
        if(desiredGroup[0].games.length == filteredGames.length ){
            return Promise.reject(new Error("Could not find the given game in the given group"));
        }
        desiredGroup[0].games = filteredGames;
    }
    return Promise.resolve("OK");
}

/**
 * 
 * @param {*} bearerToken 
 * @returns {boolean}
 */
function isUserValid(receivedToken){
    return users.filter( user => user.bearerToken == receivedToken).length > 0;
}