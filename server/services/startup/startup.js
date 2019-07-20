// var socketManager = require('../websocket/socketManager.js')
var jobScheduler = require('../job-scheduler/jobScheduler.js')
var Users = require('../../models/user.js')
var moment = require('moment')

var startup = {
    initialize() {
        console.log('')
        console.log('Initializing server startup process...')
        // socketManager.initialize()

        // jobScheduler.runEveryXMinutes(1,'Decrement User Drunk Levels', 'Server', 'decrementDrunkLevel', 'Decrement user drunk levels as needed every 30 min.', function () {
        //     Users.find().then((users) => {
        //         console.log('Decrementing user drunk levels as needed...')
        //         users.forEach(function (user) {
        //             if (user.drinking.drankAt) {
        //                 var then = moment(user.drinking.drankAt)
        //                 var now = moment()
        //                 var difference = now.diff(then, 'hours')
        //                 // console.log(difference)
        //                 if (difference >= 1 && user.drunkLevel >= .025) {
        //                     user.decrementDrunkLevel()
        //                 }
        //             }
        //         })
        //     }).catch((err) => {
        //         console.log(err)
        //     })
        // })

        // jobScheduler.getTasks()
    }
}

module.exports = startup