'use strict'

const dataMem = require('./borga-data-mem');
const gameData = require('./board-games-data');
const gameDB = require('./borga-db');

let testMode = false;

module.exports = {
    setTestMode,
    getMostPopularGames,
    searchGamesByName,
    getGameDetails,
    createUser,
    createUserWithName,
    createTestUser,
    getUserToken,
    createGroup,
    editGroup,
    getGroupDetails,
    getAllGroup,
    deleteGroup,
    addGame,
    removeGame
}



//#region  Boardgame atlas services

/**
 * Gets most popular games
 * @returns {Promise<JSON>} games
 */
// FIXME THESE 3 methods FOR TESTING RETURN ARRAYS BUT FOR REAL ITS JSON. could be better handled
function getMostPopularGames(limit) {
    if (testMode) {
        return Promise.resolve(dataMem.getMostPopularGames(limit))
            .then(games => games.length > 0 ? games : rejectPromise(404, 'Games not found'))
    }
    else {
        return gameData.getPopularGames(limit)
            .then(games => games.count > 0 ? games : rejectPromise(404, 'Games not found'))
    }
}

/**
 * Search for games that match a given name
 * @param {String} name 
 * @returns {Promise<JSON>} games
 */
function searchGamesByName(name) {
    if(!isStringArgValid(name)){
        return rejectPromise(400, "input field must be filled and not white spaces")
    }
    if (testMode) {
        return Promise.resolve(dataMem.searchGameByName(name))
            .then(games => games.length > 0 ? games : rejectPromise(404, 'Games not found'))
    }
    else {
        return gameData.getGameByname(name)
            .then(games => games.count > 0 ? games : rejectPromise(404, 'Games not found'))
    }
}

/**
 * Search for games that match a given name and return their information
 * @param {String} name 
 * @returns {Promise<JSON>} games
 */
// TODO apply a limit https://api.boardgameatlas.com/api/search?client_id=oOv7vGNRCu&name=Root&limit=1
function getGameDetails(name) {
    if (testMode) {
        return Promise.resolve(dataMem.searchGameByName(name))
            .then(games => games.length > 0 ? filterGameDetailprops(games) : rejectPromise(404, 'Games not found'))
    }
    else {
        return gameData.getGameByname(name)
            .then(games => games.count > 0 ? filterGameDetailprops(games) : rejectPromise(404, 'Games not found'))
    }
}

// TODO possibly cleanup this function
// TODO tests
/**
 * required props:
 *  id, name, description, url (at Board Game Atlas), image_url, mechanics names and category names.
 * @param {Promise<JSON>} gamesPromise
 * @returns {Promise<JSON>} games
 */
function filterGameDetailprops(gamesPromise) {
    return Promise.all(
        [
            gamesPromise,
            gameData.getMechanicsDetails(),
            gameData.getCategoriesDetails()
        ]
    ).then(zip => {
        const game = zip[0].games[0];
        const mechanicsDetails = zip[1].mechanics;
        const categoriesDetails = zip[2].categories;

        return {
            id: game.id,
            name: game.name,
            description: game.description,
            url: game.url,
            image_url: game.image_url,
            mechanicsNames: game.mechanics.map(mechanicJsonBody => {
                const matchedDetail = mechanicsDetails.find(details => details.id == mechanicJsonBody.id);
                return matchedDetail.name;
            }),
            categoryNames: game.categories.map(categoryJsonBody => {
                const matchedDetail = categoriesDetails.find(details => details.id == categoryJsonBody.id);
                return matchedDetail.name;
            })
        }
    });
}

//#endregion



//#region User services

/**
* Creates a User. to be used by api only as it does not receive username or password
* @returns {Promise.<String>} Promise with user Bearer Token
*/
function createUser() {
    return gameDB.insertUser()
        .catch(() => rejectPromise(500, 'Error Creating User'))
}

/**
* Creates a User. to be used by app.
* @returns {Promise.<String>} Promise with user Bearer Token
*/
function createUserWithName(userName, password) {
    return gameDB.getAllUsers().then(users => {
        if (users.filter(user => user.userName == userName).length > 0) {
            return rejectPromise(409, 'User name is already taken')
        }
        else {
            return gameDB.insertUser(userName, password)
                .catch(() => rejectPromise(500, 'Error Creating User'))
        }
    })
}

/**
* Creates a test User if it is not already created
* @returns {Promise.<String>} Promise with user Bearer Token
*/
function createTestUser() {
    return gameDB.getAllUsers().then(users => {
        if (users.filter(user => user.userName == "Test").length > 0) { // TODO extract test constants to an utils file
            return rejectPromise(409, 'User name is already taken')
        }
        else {
            return gameDB.insertDummyUser()
                .catch(() => rejectPromise(500, 'Error Creating User'))
        }
    })
}

/**
 *  gets a user bearer token
 * @param {String} userName 
 * @param {String} password
 * @returns {Promise.<String>} bearer token
 */
function getUserToken(userName, password) {
    return gameDB.getAllUsers().then(users => {
        const matchedUsers = users.filter(
            user => user.userName == userName && user.password == password);
        if (matchedUsers.length > 0) {
            return matchedUsers[0].bearerToken
        }
        else {
            return rejectPromise(404, 'Matching username and password not found')
        }
    })
}

//#endregion


//#region group services

/**
 *  Creates a User Group
 * @param {String} bearerToken 
 * @param {String} name
 * @param {String} description 
 * @returns {Promise<String>} newGroupId
 */
function createGroup(bearerToken, name, description) {
    if (!isStringArgValid(name)) {
        return rejectPromise(400, 'A Group must have a name')
    }
    return isUserValid(bearerToken)
        .then(isValid =>
            isValid ?
                gameDB.insertGroup(bearerToken, name, description) :
                rejectPromise(404, 'There is no user for the given bearer token')
        );
}

/**
 *  gets a group details
 * @param {String} bearerToken 
 * @param {String} groupId
 * @returns {Promise<JSON>} groupDetails
 */
function getGroupDetails(bearerToken, groupId) {
    return gameDB.getGroup(bearerToken, groupId)
        .catch(() => rejectPromise(404, 'Requested group not found'))
}

/**
 *  Edit group
 * @param {String} id 
 * @param {String} name 
 * @param {String} description 
 * @param {String} bearerToken 
 * @returns {Promise.<String>} editGroup
 */
function editGroup(bearerToken, id, name, description) {
    if (!isStringArgValid(name)) {
        return rejectPromise(400, 'A Group must have a name')
    }
    return gameDB.updateGroup(id, name, description, bearerToken)
        .catch(() => rejectPromise(404, 'Requested group not found'))
}

/**
 *  gets all groups from user
 * @param {String} bearerToken 
 * @returns {Promise<JSON>} getAllGroup
 */
function getAllGroup(bearerToken) {
    return gameDB.getAllGroups()
        .catch(() => rejectPromise(404, 'Groups not found'))
        .then(groups => groups.filter(group => group.bearerToken === bearerToken))
}

/**
 *  delete group from user
 * @param {String} id 
 * @param {String} bearerToken 
 * @returns {Promise<JSON>} deleteGroup
 */
function deleteGroup(id, bearerToken) {
    return gameDB.deleteGroup(id, bearerToken)
        .catch(err => rejectPromise(404, 'Requested group not found'))
}

//#endregion

//#region game services

/**
*  add a game to a group
* @param {String} bearerToken 
* @param {String} groupId
* @param {String} gameId
* @param {String} gameName
* @returns {Promise<undefined>}
*/
function addGame(bearerToken, groupId, gameId, gameName) {
    if (!isStringArgValid(gameId)) {
        return rejectPromise(400, 'A Game must have an id')
    }
    return gameDB.insertGame(groupId, gameId, gameName, bearerToken)
        .catch(err => rejectPromise(404, err.message));
}

/**
*  remove a game from a group
* @param {String} bearerToken 
* @param {String} groupId
* @returns {Promise<undefined>}
*/
function removeGame(bearerToken, groupId, gameId) {
    return gameDB.deleteGame(groupId, gameId, bearerToken)
        .catch(err => rejectPromise(404, err.message));
}

//#region       Utils
function setTestMode() {
    testMode = true;
}

function isStringArgValid(arg) {
    return arg != undefined && arg != null && arg.trim().length > 0
}

/**
 * 
 * @param {*} bearerToken 
 * @returns {Promise.<boolean>}
 */
function isUserValid(receivedToken) {
    return gameDB.getAllUsers().then(users =>
        users.filter(user => user.bearerToken == receivedToken).length > 0
    );
}

function rejectPromise(status, msg) {
    const err = Error(msg)
    err.status = status
    return Promise.reject(err)
}
//#endregion