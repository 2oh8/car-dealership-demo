// const server = require('../../config/dev-server.js')
// var jobScheduler = require('../job-scheduler/jobScheduler.js')

// var Users = require('../../models/user.js')
// var Parties = require('../../models/party.js')

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
//         var socket_io = require('socket.io')(3001);


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

// module.exports = socketManager