let Parties = require('../models/party')
let Users = require('../models/user')
let drinkAPI = require('../services/drinkAPI/drinkAPI.js')

function handleError(err, res) {
    res.statusMessage = err.message
    res.status(400).end();
}

module.exports = {

    search: {
        path: '/parties/',
        reqType: 'post',
        method(req, res, next) {
            Users.findById(req.session.uid)
                .then(user => {
                    var party = {}

                    party.name = req.body.name
                    party.ownerId = user._id
                    party.members = []
                    party.members.push(user._id)

                    Parties.create(party).then((result) => {
                        res.send({
                            data: result
                        })
                    }).catch((error) => {
                        handleError(error, res)
                    })
                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    getMyParties: {
        path: '/user/:userId/parties',
        reqType: 'get',
        method(req, res, next) {
            Users.findById(req.session.uid)
            .then(user => {
                Parties.find({ $or: [ { ownerId: user._id }, { members: { $in: [user._id] }}]}).then(parties => {
                    res.send({
                        data: parties
                    })
                })
                .catch(error => {
                    handleError(error, res)
                })
            })
            .catch(error => {
                handleError(error, res)
            })
        }
    },

    getPartyById: {
        path: '/user/:userId/parties/:partyId',
        reqType: 'get',
        method(req, res, next) {
            Users.findById(req.session.uid)
            .then(user => {
                Parties.findOne({ _id : req.params.partyId, $or: [ { ownerId: user._id }, { members: { $in: [user._id] }}]}).then(party => {
                    res.send({
                        data: party
                    })
                })
                .catch(error => {
                    handleError(error, res)
                })
            })
            .catch(error => {
                handleError(error, res)
            })
        }
    },

}
