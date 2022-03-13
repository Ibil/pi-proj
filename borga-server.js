'use strict'

const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const openapi = YAML.load('docs/borga-api-spec.yml')

// for dummyData
const gameDB = require('./lib/borga-db');

/* const dataMem = require('./lib/borga-data-mem');
 */

const HEROKU_PORT = process.env.PORT
const PORT = HEROKU_PORT ?? 3000

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi))
require('./lib/borga-router')(app)


//insertDummies().then(() => {
    app.listen(PORT, () => {
        console.log(`Borga app listening on port ${PORT}!`)
    });
//});


function insertDummies() {
    // create user, create group, add game
/*     const dummy = gameDB.insertDummyUser("8ab8dd96-4c74-4c91-be3d-f8011d92f1ff").then( auth => { // FIXME i am always creating this user
        console.log("Dummy data introduced for user " + auth)
        dataMem.createGroup(auth, "group test name", "desc").then(groupID => {
            dataMem.addGame(auth, groupID, "root", "myNamge")
        })
    })
    return Promise.all([dummy]) */
}