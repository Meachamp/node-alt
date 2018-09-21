const neo4j = require('neo4j-driver').v1
const util = require('util')
const config = require('./config')

module.exports = neo4j.driver(util.format('bolt://%s', config.database.host), 
                neo4j.auth.basic(config.database.username, config.database.password))
