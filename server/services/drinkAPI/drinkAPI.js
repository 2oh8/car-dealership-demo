

var apiBaseUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s='
var apiBaseUrlForSearchById = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i='

var request = require('superagent')

var drinkAPI = {
    find(search) {
        return new Promise(function (resolve, reject) {
            // console.log(search)
            var requestString = apiBaseUrl + search
            request
                .get(requestString)
                .end((err, res) => {
                    if (err) {
                        // console.log(err)
                        reject(err)
                    } else {
                        // console.log(res)
                        resolve(res.body.drinks)
                    }
                    // Do something
                });
        })
    },
    findByID(id) {
        return new Promise(function (resolve, reject) {

            var requestString = apiBaseUrlForSearchById + id
            request
                .get(requestString)
                .end((err, res) => {
                    if (err) {
                        // console.log(err)
                        reject(err)
                    } else {
                        // console.log(res)
                        resolve(res.body.drinks)
                    }
                    // Do something
                });
        })
    }
}

module.exports = drinkAPI