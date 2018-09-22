const db = require('../db')
const auth = require('../auth')


module.exports = (app) => {
    app.post('/ip', (req, res) => {
        let response = {success: true}
        let token = req.body.token
        let ip = req.body.ip

        let session = db.session()

        if(!token || !ip) {
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

        session.run('MATCH (suspect:IP {id:{ipParam})-[*1..9]-(alt:Player) RETURN DISTINCT alt.id', {ipParam: ip})
        .then((result) => {
            response.records = result.records.map((rec) => {
                return rec.get('alt.id').toString()
            })
            response.count = result.records.length
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