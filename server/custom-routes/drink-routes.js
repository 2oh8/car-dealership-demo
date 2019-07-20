let Drinks = require('../models/drink')
let drinkAPI = require('../services/drinkAPI/drinkAPI.js')

function handleError(err, res) {
    res.statusMessage = err.message
    res.status(400).end();
}

module.exports = {

    search: {
        path: '/drinks/',
        reqType: 'post',
        method(req, res, next) {
            var search = req.body.search
            drinkAPI.find(search).then((drinks) => {
                // console.log(drinks)
                res.send({
                    data: drinks
                })
            }).catch((err) => {
                handleError(err, res)
            })
        }
    },
    searchById: {
        path: '/drinks/:drinkId',
        reqType: 'get',
        method(req, res, next) {

            drinkAPI.findByID(req.params.drinkId).then((drink) => {
                // console.log(drinks)
                res.send({
                    data: drink
                })
            }).catch((err) => {
                handleError(err, res)
            })
        }
    },

}


function handleResponse(action, data, error) {
    var response = {
        action: action,
        data: data
    }
    if (error) {
        response.error = error
    }
    return response
}