const mysql = require('mysql2')
const config = require('./config')

const db = mysql.createPool({
    host: config.sql.host,
    username: config.sql.username,
    password: config.sql.password,
    port: config.sql.port,
    database: config.sql.database
})

let mod = {}
mod.checkToken = function(token) {
    var promise = new Promise((accept, reject) => {
        db.query(
            "SELECT 1 FROM tokens WHERE token = ?",
            [token],
            (err, res) => {
                if(err) {
                    console.log(err)
                }

                if(!err && res && res.length > 0) {
                    accept(true)
                } else {
                    accept(false)
                }
            }
        )
    })
    return promise
}

mod.dbQuery = function(q, set) {
    return new Promise((resolve, reject) => {
        db.query(
        q,
        set,
        (...params) => {
            resolve([...params])
        }
        )
    })
}

module.exports = mod