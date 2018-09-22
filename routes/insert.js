const db = require('../db')

module.exports = (app) => {
    app.post('/insert', (req, res) => {
        let response = {success: true}
        let token = req.body.token;

        let session = db.session()

        let steamid = req.body.steamid
        let ip = req.body.ip

        session.run('MERGE (n:IP{ip:{ipParam}}) MERGE (m:Player{id:{steamParam}}) MERGE (n)-[:link]->(m)', {steamParam: steamid, ipParam:ip})
        .then((result) => {
            session.close()
            res.send(response)
        }).catch((err) => {
            response.success = false
            res.send(response)
            console.log(err)
        })
    })
}