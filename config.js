let config = {}
config.database = {}
config.server = {}
config.sql = {}

config.database.username = 'neo4j'
config.database.password = 'test'
config.database.host = 'localhost'

config.sql.username = 'test'
config.sql.password = 'test'
config.sql.database = 'alt'
config.sql.host = 'localhost'
config.sql.port = 3306

config.server.listenPort = 4000


module.exports = config