const db = require('../db')
const auth = require('../auth')

module.exports = (app) => {
    app.post('/steamid', async (req, res) => {
        let response = {success: true}
        let token = req.body.token;
        let steamid = req.body.steamid

        let session = db.session()
        
        if(!token || !steamid) {
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

        session.run('MATCH (suspect:Player {id:{steamParam}})-[*1..9]-(alt:Player) RETURN DISTINCT alt.id', {steamParam: steamid})
        .then((result) => {
            response.records = result.records.map((rec) => {
                return rec.get('alt.id').toString()
            })
            response.count = response.records.length
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