'use strict'

const { expect} = require('@jest/globals');

const borgaServices = require('../lib/borga-services');
const dataMem = require('../lib/borga-data-mem');

jest.setTimeout(50000)

test('test get most popular games successfully', async () => {
    borgaServices.setTestMode();
    dataMem.addMockGame('a', 11)
    dataMem.addMockGame('a', 9)
    await borgaServices.getMostPopularGames(10)
        .then(games => {
            expect(games.length > 0)
                games.forEach(game => 
                    expect(game.rank).toBeGreaterThanOrEqual(10))
                })
})


test('test search game by name successfully', async () => {
    borgaServices.setTestMode();
    dataMem.addMockGame('a', 11)
    dataMem.addMockGame('Azul', 9)
    await borgaServices.searchGamesByName('Azul')
        .then(games => {
            expect(games.length > 0)
            games.forEach(game => expect(game.name).toMatch(/(Azul)/))
        })
})

test('test getGameDetails no results', async () => {
    borgaServices.setTestMode();
    await borgaServices.getGameDetails('zziiga')
    .then(() => { throw Error('Assertion failed. It should not succeed ') })
    .catch( err => {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Games not found');
    })
})


test('Create user assigns a bearer token', async () => {

    const bearerToken = await borgaServices.createUser();
    expect(bearerToken).toBeDefined();
    expect(bearerToken).not.toBeNull();
    expect(bearerToken).not.toBe("");
    expect(bearerToken).not.toMatch(/ /);

    expect(bearerToken.length).toBeDefined();
    expect(bearerToken.length).toBeGreaterThan(5);

    // TODO we could be more specific https://www.rfc-editor.org/rfc/rfc4122.txt
});


test('Create group', async () => {

    const testUser = await borgaServices.createUser();
    borgaServices.createGroup(testUser, "my group", "my desc")
        .then(newGroupid => {
            expect(newGroupid).toBeDefined();
            expect(newGroupid).not.toBeNull();
            expect(newGroupid).not.toBe("");
            expect(newGroupid).not.toMatch(/ /);
            expect(newGroupid.length).toBeGreaterThan(5);

            borgaServices.getGroupDetails(testUser, newGroupid).then( groupDetails => {
                expect(groupDetails.name).toBe("my group");
                expect(groupDetails.description).toBe("my desc");
                expect(groupDetails.games).toStrictEqual([]);
            })
    });
});


test('Edit group', async () => {

    const testUser = await borgaServices.createUser();
    const idGroup = await borgaServices.createGroup(testUser,"group","desc");
    borgaServices.editGroup(testUser,idGroup, "my group", "my desc")
        .then(groupId => {
            expect(groupId).toBeDefined();
            expect(groupId).not.toBeNull();
            expect(groupId).not.toBe("");
            expect(groupId).not.toMatch(/ /);
            expect(groupId.length).toBeGreaterThan(5);

            borgaServices.getGroupDetails(testUser, groupId).then( groupDetails => {
                expect(groupDetails.name).toBe("my group");
                expect(groupDetails.description).toBe("my desc");
                expect(groupDetails.games).toStrictEqual([]);
            })
    });
});

test('Edit a group when the use has 2 groups with the same name', async () => {

    const groupName = "same group name";

    const testUser = await borgaServices.createUser();
    const idGroup = await borgaServices.createGroup(testUser,groupName ,"group 1");
    const idGroup2 = await borgaServices.createGroup(testUser,groupName ,"group 2");
    borgaServices.editGroup(testUser,idGroup, groupName, "change desc")
        .then(groupId => {
            expect(groupId).toBeDefined();
            expect(groupId).not.toBeNull();
            expect(groupId).not.toBe("");
            expect(groupId).not.toMatch(/ /);
            expect(groupId.length).toBeGreaterThan(5);
            expect(groupId).toStrictEqual(idGroup);

            borgaServices.getGroupDetails(testUser, groupId).then( groupDetails => {
                expect(groupDetails.name).toBe(groupName);
                expect(groupDetails.description).toBe("change desc");
                expect(groupDetails.games).toStrictEqual([]);
            })

            borgaServices.getGroupDetails(testUser, idGroup2).then( groupDetails => {
                expect(groupDetails.name).toBe(groupName);
                expect(groupDetails.description).toBe("group 2");
                expect(groupDetails.games).toStrictEqual([]);
            })
    });
});


test('Get invalid  group', async () => {

    const testUser = await borgaServices.createUser();
    borgaServices.createGroup(testUser, "my group", "my desc")
        .then(newGroupid => {
            expect(newGroupid).toBeDefined();
            expect(newGroupid).not.toBeNull();
            expect(newGroupid).not.toBe("");
            expect(newGroupid).not.toMatch(/ /);
            expect(newGroupid.length).toBeGreaterThan(5);

            borgaServices.getGroupDetails(testUser, "123")
                .then(tasks => { throw Error('Assertion failed. It should not succeed getting a group that does not exist.') })
                .catch( err => {
                    expect(err.status).toBe(404);
                    expect(err.message).toBe('Requested group not found');
                })
    });
});

test('Create group with an inexistent token', async () => {

   borgaServices.createGroup("fakeToken", "my group", "my desc")
        .then(tasks => { throw Error('Assertion failed. It should not succeed creating a group.') })
        .catch(err => {
            expect(err.status).toBe(404);
            expect(err.message).toBe('There is no user for the given bearer token');
        })
});


test('Add a game to a group, get it and remove it', async () => {

    const testUser = await borgaServices.createUser();
    const groupId = await borgaServices.createGroup(testUser, "my group", "my desc");

    await borgaServices.addGame(testUser, groupId, "gameid11", "gameName");

    let groupDetails = await borgaServices.getGroupDetails(testUser, groupId);

    expect(groupDetails.name).toBe("my group");
    expect(groupDetails.description).toBe("my desc");
    expect(groupDetails.games.length).toBe(1);
    expect(groupDetails.games[0].gameId).toBe("gameid11");
    expect(groupDetails.games[0].gameName).toBe("gameName");
    
    await borgaServices.removeGame(testUser, groupId, "gameid11");

    groupDetails = await borgaServices.getGroupDetails(testUser, groupId);

    expect(groupDetails.games.length).toBe(0);    
});


test('Add a game to a group that does not exist', async () => {

    const testUser = await borgaServices.createUser();
    const groupId = "falseGroupID"

    await borgaServices.addGame(testUser, groupId, "gameid11", "gameName")
    .then(tasks => { throw Error('Assertion failed. It should not succeed adding a game to a group.') })
    .catch(err => {
        expect(err.status).toBe(404);
        expect(err.message).toBe('No group with id falseGroupID');
    })
});


test('Remove a game from a group that does not exist', async () => {

    const testUser = await borgaServices.createUser();
    const groupId = await borgaServices.createGroup(testUser, "my group", "my desc");

    await borgaServices.addGame(testUser, groupId, "gameid11", "gameName");

    let groupDetails = await borgaServices.getGroupDetails(testUser, groupId);

    expect(groupDetails.name).toBe("my group");
    expect(groupDetails.description).toBe("my desc");
    expect(groupDetails.games.length).toBe(1);
    expect(groupDetails.games[0].gameId).toBe("gameid11");
    expect(groupDetails.games[0].gameName).toBe("gameName");
    
    await borgaServices.removeGame(testUser, "falseGroup", "gameid11")
    .then(tasks => { throw Error('Assertion failed. It should not succeed removing a game from an inexistent group.') })
    .catch(err => {
        expect(err.status).toBe(404);
        expect(err.message).toBe('No group with id falseGroup');
    })
});

test('Remove a game that does not exist', async () => {

    const testUser = await borgaServices.createUser();
    const groupId = await borgaServices.createGroup(testUser, "my group", "my desc");

    await borgaServices.addGame(testUser, groupId, "gameid11", "gameName");

    let groupDetails = await borgaServices.getGroupDetails(testUser, groupId);

    expect(groupDetails.name).toBe("my group");
    expect(groupDetails.description).toBe("my desc");
    expect(groupDetails.games.length).toBe(1);
    expect(groupDetails.games[0].gameId).toBe("gameid11");
    expect(groupDetails.games[0].gameName).toBe("gameName");
    
    await borgaServices.removeGame(testUser, groupId, "falseGame")
    .then(tasks => { throw Error('Assertion failed. It should not succeed removing a game that does not exist.') })
    .catch(err => {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Could not find the given game in the given group');
    })
});