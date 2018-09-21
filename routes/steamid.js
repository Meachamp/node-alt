const db = require('../db')

module.exports = (app) => {
    app.post('/steamid', (req, res) => {
        let response = {success: true}
        let token = req.body.token;

        let session = db.session()

        let steamid = req.body.steamid

        session.run('MATCH (suspect:Player {id:{steamParam}})-[*1..9]-(alt:Player) RETURN DISTINCT alt.id', {steamParam: steamid})
        .then((result) => {
            console.log(result.records[0].get(0))
            response.records = result.records.map((rec) => {
                return rec.get('alt.id').toString()
            })
            response.count = response.records.length
            session.close()
            res.send(response)
        }).catch((err) => {
            response.success = false
            res.send(response)
            console.log(err)
        })
    })
}