const db = require('../db')

module.exports = (app) => {
    app.post('/ip', (req, res) => {
        let response = {success: false}
        let token = req.body.token;

        let session = db.session()

        session.run('MATCH (suspect:IP {id:steamParam})-[*1..9]-(alt:Player) RETURN DISTINCT alt.id', {steamParam: req.body.ip})
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