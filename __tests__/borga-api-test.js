'use strict'

const request = require('supertest')
const express = require('express')
const jestOpenAPI = require('jest-openapi').default
const { expect } = require('@jest/globals');

// Load an OpenAPI file (YAML or JSON) into this plugin
jestOpenAPI(process.cwd() + '/docs/borga-api-spec.yml');

jest.setTimeout(30000);

/**
 * Setup express app
 */
const app = express()
require('./../lib/borga-router')(app)

const AUTHORIZATION_HEADER_KEY = "Authorization";




test('Create user assigns a bearer token', async () => {

    return request(app)
    .post('/user')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(resp => {
        expect(resp).toSatisfyApiSpec();


        expect(resp.body.bearerToken).not.toBeNull();
        expect(resp.body.bearerToken).toBeDefined();
        expect(resp.body.bearerToken.length).toBeGreaterThan(5);

        return true;
    })
});

 
test('Create group with bearer token', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                expect(createGroupResp).toSatisfyApiSpec();

                expect(createGroupResp.body.groupId).toBeDefined();
                expect(createGroupResp.body.groupId.length).toBeGreaterThan(5);

                request(app)
                .get(`/group/${createGroupResp.body.groupId}`)
                .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
                .expect(200)
                .expect('Content-Type', /json/)
                .then(getGroupResp => {
                    expect(getGroupResp).toSatisfyApiSpec();

                    expect(getGroupResp.body.name).toBe("meugrupo");
                    expect(getGroupResp.body.description).toBe("accao");
                    expect(getGroupResp.body.games).toStrictEqual([]);
                });
                

                return true;
            })
    
    });
});


test('get inexistent group', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                
                expect(createGroupResp).toSatisfyApiSpec();

                expect(createGroupResp.body.groupId).toBeDefined();
                expect(createGroupResp.body.groupId.length).toBeGreaterThan(5);

                return request(app)
                .get(`/group/false-nok-11-22-44`)
                .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
                .expect(404)
                .expect('Content-Type', /json/); 
            });    
    });
});



test('Failed to Create group with inexsitent bearer token', async () => {

    return request(app)
    .post('/group')
    .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
    .send({ 
        "name": "meugrupo",
        "description": "accao"
    })
    .expect(404);
});



test('Failed to add a game to an inexsitent group', async () => {
    return request(app)
    .post('/group/game')
    .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
    .send({ 
        "groupId": "fake",
        "gameId": "accao",
        "gameName": "ola"
    })
    .expect(404)
    .expect({ message: 'No group with id fake'});
});


test('Failed to remove a game from an inexsitent group', async () => {
    return request(app)
    .delete('/group/game')
    .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
    .send({ 
        "groupId": "api-test-fake",
        "gameId": "accao"
    })
    .expect(404)
    .expect({ message: "No group with id api-test-fake"});
}); 

test('Group inexsitent cant edit', async () => {
            return request(app)
                .put('/group')
                .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
                .send({ 
                        "id": "123",
                        "name": "eff",
                        "description": "fef"
                })
            .expect(404)
            .expect({ message: 'Requested group not found'});
});

test('Group inexsitent cant delete', async () => {
    return request(app)
        .delete('/group/123')
        .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
    .expect(404)
    .expect({ message : 'Requested group not found' });
});

test('Edit group sucess', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                expect(createGroupResp).toSatisfyApiSpec();

                expect(createGroupResp.body.groupId).toBeDefined();
                expect(createGroupResp.body.groupId.length).toBeGreaterThan(5);

                request(app)
                .put('/group')
                .set(`${AUTHORIZATION_HEADER_KEY}` ,`Bearer ${thisTestUser}`)
                .set('Accept', 'application/json')
                .send({ 
                        "id": createGroupResp.body.groupId,
                        "name": "eff",
                        "description": "fef"
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    expect(resp).toSatisfyApiSpec();
                    expect(resp.body).toBeDefined();
                    expect(resp.body).toStrictEqual({ 
                        groupId : createGroupResp.body.groupId,
                    });
                });
              
                return true;
            });
    
    }); 
});

test('Delete group sucess', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                expect(createGroupResp).toSatisfyApiSpec();

                expect(createGroupResp.body.groupId).toBeDefined();
                expect(createGroupResp.body.groupId.length).toBeGreaterThan(5);

                request(app)
                .delete(`/group/${createGroupResp.body.groupId}`)
                .set(`${AUTHORIZATION_HEADER_KEY}` ,`Bearer ${thisTestUser}`)
                .expect(200)
                .then(delResp => {}); // TODO see if necessary
              
                return true;
            });
    
    }); 
});


test('Failed to remove a game that is not in a group', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                return request(app)
                .delete('/group/game')
                .set(`${AUTHORIZATION_HEADER_KEY}` ,`123`)
                .send({ 
                    "groupId": createGroupResp.body.groupId,
                    "gameId": "accao"
                })
                .expect(404)
                .expect({ message: 'group not found for this user'})
                .then(resp => expect(resp).toSatisfyApiSpec());
            });
    });
});


test('get all groups from user', async () => {
    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                expect(createGroupResp).toSatisfyApiSpec();

                expect(createGroupResp.body.groupId).toBeDefined();
                expect(createGroupResp.body.groupId.length).toBeGreaterThan(5);

                request(app)
                .get('/groups')
                .set(`${AUTHORIZATION_HEADER_KEY}` ,`Bearer ${thisTestUser}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    expect(resp).toSatisfyApiSpec();
                    expect(resp.body).toBeDefined();
                    expect(resp.body.length).toBe(1);
                    expect(resp.body[0]).toStrictEqual({ 
                        id : createGroupResp.body.groupId,
                        bearerToken : thisTestUser,
                        "name": "meugrupo",
                        "description": "accao",
                        games: []
                    });
                });
              
                return true;
            });
    
    }); 
});

test(' Successfuly Add and remove a game from a group', async () => {

    await request(app)
    .post('/user').then(resp => {
        let thisTestUser = resp.body.bearerToken;

        return request(app)
            .post('/group')
            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
            .set('Accept', 'application/json')
            .send({ 
                "name": "meugrupo",
                "description": "accao"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(createGroupResp => {
                const groupId = createGroupResp.body.groupId;

                return request(app)
                .post('/group/game')
                .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
                .set('Accept', 'application/json')
                .send({ 
                    "groupId": groupId,
                    "gameId": "accao",
                    "gameName": "Resistance"
                })
                .expect(200)
                .then(createGameResp => {

                    expect(createGameResp).toSatisfyApiSpec();

                    // get : expect
                    return request(app)
                    .get(`/group/${groupId}`)
                    .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .then(getGroupResp => {
                        expect(getGroupResp).toSatisfyApiSpec();
                        expect(getGroupResp.body.games.length).toBe(1);
                        expect(getGroupResp.body.games).toStrictEqual([{ gameId : "accao" , gameName : "Resistance" }]);

                        // remove
                        return request(app)
                        .delete('/group/game')
                        .set(`${AUTHORIZATION_HEADER_KEY}` ,`Bearer ${thisTestUser}`)
                        .set('Accept', 'application/json')
                        .send({ 
                            "groupId": groupId,
                            "gameId": "accao",
                        })
                        .expect(200)
                        .then(deleteGameResp => {
                            expect(deleteGameResp).toSatisfyApiSpec();
                            
                            // get : expect 
                            return request(app)
                            .get(`/group/${groupId}`)
                            .set(AUTHORIZATION_HEADER_KEY ,`Bearer ${thisTestUser}`)
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .then(secondGetGroupResp => {
                                        
                                expect(secondGetGroupResp).toSatisfyApiSpec();
                                expect(secondGetGroupResp.body.games.length).toBe(0);
                                return true;
                            });
                        });
                    });
                });
            });
    });
});


test('10 Games popular sucess', async () => {
    return request(app)
        .get('/games/popular/10')
    .expect(200)
    .then(resp =>{
        expect(resp.body.games.length).toBe(10)
    });
});

test('Popular Games not found', async () => {
    return request(app)
        .get('/games/popular/')
    .expect(404)
});


test('Search game by name sucess', async () => {
    return request(app)
        .get('/search/games/Catan')
    .expect(200)
    .then(resp =>{
        let allGamesName = resp.body.games.map(r=> r.name);
        let game = allGamesName.find(ele => ele === 'Catan')
        expect(game).toEqual('Catan')
    });
});

test('Search game by name not found', async () => {
    return request(app)
        .get('/search/games/asadad')
    .expect(404)
});