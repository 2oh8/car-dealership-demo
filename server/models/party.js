let mongoose = require('mongoose')
let Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId
let Models = require('../config/constants').models
let drinkAPI = require('../services/drinkAPI/drinkAPI.js')
let socketManager = require('../services/websocket/socketManager.js')
let bcrypt = require('bcryptjs')
const SALT_FACTOR = 10
const request = require('superagent');
// const btoa = require('btoa')
let spotifyConfig = require('../services/spotify/spotify.js').config



let schema = new Schema({
  name: { type: String, required: true, unique: true, dropDups: true },
  ownerId: { type: String, required: true, },
  messages: { type: Array, required: true, default: [] },
  members: { type: Array, required: true, default: [] },
  nowPlaying: { type: Object, required: true, default: {} },
  queue: { type: Array, required: true, default: [] },
})


// schema.pre('save', function (next) {
 
// });
schema.methods.insertMessage = function(message) {
  this.messages.push(message)
  this.markModified('messages')
  this.save()
}

schema.methods.addToQueue = function (song) {
  var party = this
  var nowPlaying = this.nowPlaying
  if (nowPlaying.item) {
    if (this.nowPlaying.item.id == song.item.id && this.nowPlaying.addedBy == song.addedBy) {
      party.nowPlaying = song
      party.markModified('nowPlaying')
    } else {
      party.queue.push(song)
      party.markModified('queue')
    }
  } else {
    if (party.queue.length > 0) {

      party.queue.push(song)
      party.markModified('queue')
    } else {
      party.nowPlaying = song
      party.markModified('nowPlaying')
    }
  }
  party.queue.sort(function (a, b) {
    a = new Date(a.addedToQueue);
    b = new Date(b.addedToQueue);
    return a > b ? -1 : a < b ? 1 : 0;
  });
  party.save()
  // socketManager.notifyParty(party._id, 'update', 'Something changed...')
};

module.exports = mongoose.model('Party', schema)