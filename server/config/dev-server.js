var env = require('./env')
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var defaultErrorHandler = require('./handlers').defaultErrorHandler
var corsOptions = require('./handlers').corsOptions
// var api = require('../models')
var startup = require('../services/startup/startup.js')
// var session = require('../authentication/sessions')
// var Auth = require('../authentication/auth')

// ENABLE ROUTES IF USING app SIDE ROUTING
// import routes from './routes'

let app = express()
let server = require('http').createServer(app)

// var redirector = require(`./redirector`);
// redirector.init()

// function Validate(req, res, next) {
//     // ONLY ALLOW GET METHOD IF NOT LOGGED IN 
//     //console.log(req.session)
//     if (req.method !== 'GET' && !req.session.uid) { //req.method !== 'GET' && 
//         return res.send({ error: 'Please Login or Register to continue' })
//     }
//     return next()
// }

// function logger(req, res, next) {
//     console.log('')
//     console.log('INCOMING REQUEST', req.originalUrl)
//     next()
// }

// // REGISTER MIDDLEWARE
// app.use(session)
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/../static"))
// app.use('*', logger)
// app.use('*', cors(corsOptions))
// app.use('/', Auth)


// // LOCKS API TO REQUIRE USER AUTH
// app.use(Validate)
// app.use('/api', api)
// app.use('/', defaultErrorHandler)

startup.initialize()

// var jobScheduler = require('../services/job-scheduler/jobScheduler.js')

// var Users = require('../models/user.js')
// var Parties = require('../models/party.js')

// var io = null

// var socketRegistry = {}

// var channels = {}

// var parties = {}

// var socketManager = {
//     initialize() {
//         var instance = this
//         this.reap()
//         // console.log('')
//         // console.log('Initializing socket manager...')
//         var socket_io = require('socket.io')(server);


//         io = socket_io

//         // io.configure(function () { 
//         //     io.set("transports", ["xhr-polling"]); 
//         //     io.set("polling duration", 10); 
//         // });

//         io.on('connection', function (socket) {
//             // console.log(socket)
//             // console.log('')
//             // console.log('New websocket connection established...');

//             socket.on('establish', function (uid) {
//                 // console.log(uid)
//                 socketRegistry[uid] = {
//                     socket: socket,
//                     authenticated: false
//                 }
//                 io.to(socketRegistry[uid].socket.id).emit('verify', uid);
//             })

//             socket.on('join', function (data) {
//                 // console.log(data)
//                 if (parties[data.partyId]) {
//                     if (parties[data.partyId].includes(data.uid) == false) {
//                         parties[data.partyId].push(data.uid)
//                     } else {
//                         // Do nothing?
//                     }
//                     socket.join(data.partyId)
//                 } else {
//                     parties[data.partyId] = [data.uid]
//                     socket.join(data.partyId)
//                 }
//                 instance.notifyParty(data.partyId, 'join', 'Someone joined...');
//             })

//             socket.on('nowPlaying', function (data) {
//                 // console.log(data)
//                 if (parties[data.partyId]) {
//                     Parties.findById(data.partyId).then((party) => {
//                         // delete data.partyId
//                         party.addToQueue(data)
//                         io.to(data.partyId).emit('update', 'Something changed...');
//                     }).catch((err) => {
//                         console.log(err)
//                     })
//                 } else {

//                 }
//                 // instance.notifyParty(data.partyId, 'update', 'Something changed...');
//             })

//             socket.on('message', function (data) {
//                 console.log(data)
//                 if (parties[data.partyId]) {
//                     Parties.findById(data.partyId).then((party) => {
//                         // delete data.partyId
//                         party.insertMessage(data)
//                         io.to(data.partyId).emit('update', 'Something changed...');
//                     }).catch((err) => {
//                         console.log(err)
//                     })
//                 } else {

//                 }
//                 // instance.notifyParty(data.partyId, 'update', 'Something changed...');
//             })

//         });


//     },
//     validate(uid) {
//         // console.log('')
//         // console.log('Validating socket for ' + uid + '...')
//         socketRegistry[uid].valid = true
//     },
//     notify(_id, channel, message) {
//         io.to(socketRegistry[_id].socket.id).emit(channel, message);
//     },
//     notifyParty: function (_id, channel, message) {
//         io.sockets.to(_id).emit(channel, message);
//     },
//     reap() {
//         jobScheduler.runEveryXMinutes(1, 'Socket Reaper', 'Server', 'socketReaper', 'Runs every minute to kill inactive or invalid sockets.', function () {
//             // console.log(io)
//         })
//     }
// }

// socketManager.initialize()

// app.use('/websocketauth', function (req, res, next) {
//     Users.findById(req.session.uid).then(user => {
//         socketManager.validate(user._id)
//         // debugger
//         res.send()
//     }).catch(err => {
//         handleError(err, res)
//     })
// })
// // let io = require('socket.io')(server, {
// //     origins: '*:*'
// // })

// // io.on('connection', function (socket) {
// //     socket.emit('CONNECTED', {
// //         socket: socket.id,
// //         message: 'Welcome to the Jungle'
// //     })

// //     socket.on('update', (d) => {
// //         console.log(d)
// //     })

// // })

module.exports = {
    server: server,
    // socketManager: socketManager
}