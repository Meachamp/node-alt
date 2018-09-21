const db = require('../db')

module.exports = (app) => {
    app.post('/insert', (req, res) => {
        let response = {success: false}
        let token = req.body.token;

        let session = db.session()

        let steamid = req.body.steamid
        let ip = req.body.ip

        session.run('MERGE (n:IP{ip:ipParam}) MERGE (m:Player{id:steamParam}) MERGE (n)-[:link]->(m)', {steamParam: steamid, ipParam:ip})
        .then((result) => {
            response.records = result.records
            response.count = result.records.length
            session.close()
            res.send(response)
        }).catch((err) => {
            res.send(response)
            console.log(err)
        })
    })
}