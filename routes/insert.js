const db = require('../db')
const auth = require('../auth')

module.exports = (app) => {
    app.post('/insert', async (req, res) => {
        let response = {success: true}

        let token = req.body.token;
        let steamid = req.body.steamid
        let ip = req.body.ip

        let session = db.session()

        if(!token || !steamid || !ip) {
            response.success = false
            response.error = "Incorrect parameters."
            res.send(response)
            return
        }

        let authorized = await auth.checkToken(token)

        if(!authorized) {
            response.success = false
            response.error = "Unauthorized."
            res.send(response)
            return
        }

        session.run('MERGE (n:IP{ip:{ipParam}}) MERGE (m:Player{id:{steamParam}}) MERGE (n)-[:link]->(m)', {steamParam: steamid, ipParam:ip})
        .then((result) => {
            session.close()
            res.send(response)
        }).catch((err) => {
            response.success = false
            response.error = "Internal error."
            res.send(response)
            console.log(err)
        })
    })
}