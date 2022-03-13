"use strict";
const express = require("express");

const app = express();
const services = require("./borga-services");
const router = express.Router();

const AUTHORIZATION_HEADER_KEY = "Authorization";

router.get("/games/popular/:limit", (req, res, next) => {
  services.getMostPopularGames(req.params.limit)
    .then((games) => res.json(games))
    .catch(next)
})

router.get("/search/games/:name", (req, res, next) => {
  services.searchGamesByName(req.params.name)
    .then((games) => res.json(games))
    .catch(next)
})

router.get("/games/gameDetails/:name", (req, res, next) => {
  services.getGameDetails(req.params.name)
    .then(details => res.json(details))
    .catch(next)
})



router.post("/user", (req, res, next) => {
  services
    .createUser()
    .then((bearerToken) => res.json({ bearerToken: bearerToken })) // TODO deprecate ? or keep for api only user creation
    .catch(next);
});

router.put("/user/signin/:userName", (req, res, next) => {
  services
    .getUserToken(req.params.userName, req.body.password)
    .then(bearerToken =>
      req.logIn(bearerToken, err => { // passport with bearer token instead of user for compatibility with api and simplicity
        if (err) next(err)
        else res.json({ bearerToken: bearerToken })
      })
    )
    .catch(next);
});

router.put("/users/:userName", (req, res, next) => {
  services
    .createUserWithName(req.params.userName, req.body.password)
    .then(bearerToken =>
      req.logIn(bearerToken, err => { // passport with bearer token instead of user for compatibility with api and simplicity
        if (err) next(err)
        else res.json({ bearerToken: bearerToken })
      })
    )
    .catch(next);
});


router.post("/group/game", (req, res, next) => {
  services
    .addGame(
      extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)),
      req.body.groupId,
      req.body.gameId,
      req.body.gameName
    )
    .then((result) => res.json(result))
    .catch(next);
});

router.delete('/group/game', (req, res, next) => {
  services
    .removeGame(
      extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)),
      req.body.groupId,
      req.body.gameId
    )
    .then((result) => res.json(result))
    .catch(next);
});

router.post("/group", (req, res, next) => {
  services
    .createGroup(
      extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)),
      req.body.name,
      req.body.description
    )
    .then((newGroupId) => res.json({ groupId: newGroupId }))
    .catch(next);
});

router.put("/group", (req, res, next) => {
  services
    .editGroup(
      extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)),
      req.body.id,
      req.body.name,
      req.body.description
    )
    .then((group) => res.json({ groupId: group }))
    .catch(next);
});

router.get("/groups", (req, res, next) => {
  services
    .getAllGroup(extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)))
    .then((groups) => {
      res.json(groups);
    })
    .catch(next);
});

router.get("/group/:groupId", (req, res, next) => {
  services
    .getGroupDetails(
      extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)),
      req.params.groupId
    )
    .then((groupJson) => res.json(groupJson))
    .catch(next);
});



router.delete("/group/:groupId", (req, res, next) => {
  services
    .deleteGroup(req.params.groupId, extractBearerToken(req.header(AUTHORIZATION_HEADER_KEY)))
    .then((group) => res.json(group))
    .catch(next);
});

router.put("/test/initialize", (req, res, next) => {
  createDummyAppData()
    .then(() => res.end())
    .catch(next);
});


/** TODO could be a middleware
 * 
 * @param {string} authorizationHeader 
 * @returns {string} bearerToken
 */
function extractBearerToken(authorizationHeader) {
  const splitArray = authorizationHeader.split("Bearer ");
  return splitArray.length > 0 ? splitArray[1] : "";
}

async function createDummyAppData() {
  // create user, create group, add game
  const token = await services.createTestUser();
  const groupId = await services.createGroup(token, "group test name", "desc");
  return await services.addGame(token, groupId, "root", "myName");
}

module.exports = router;
