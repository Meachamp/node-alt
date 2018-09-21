const neo4j = require('neo4j').v1
const util = require('util')
const config = require('./config')

let driver = neo4j.driver(util.format('bolt://%s', config.database.host), 
                neo4j.auth.basic(config.database.username, config.database.password))

