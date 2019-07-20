let mongoose = require('mongoose')
let Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId
let Models = require('../config/constants').models
let drinkAPI = require('../services/drinkAPI/drinkAPI.js')
let socketManager = require('../services/websocket/socketManager.js')
let bcrypt = require('bcryptjs')
const SALT_FACTOR = 10
let request = require('superagent');
// const btoa = require('btoa')
let spotifyConfig = require('../services/spotify/spotify.js').config
let lyftConfig = require('../services/lyft/lyft.js').config

let schema = new Schema({
  username: { type: String, required: true, unique: true, dropDups: true },
  email: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  zipCode: { type: String, required: true },
  username: { type: String, required: true },
  friends: { type: Array, default: [] },
  parties: { type: Array, default: [] },
  bars: { type: Array, default: [] },
  liquorStores: { type: Array, default: [] },
  drinks: { type: Array, default: [] },
  drinking: { type: Array, default: [] },
  status: { type: Object, default: {
    message: '',
    setAt: new Date()
  } },
  drunkLevel: { type: Number, default: 0 },
  preferences: { type: Object, default: {} },
  activityFeed: { type: Array, default: [] },
  requests: { type: Array, default: [] },
  spotifyId: { type: String, default: '' },
  spotify: { type: Object, required: true, default: {} },
  lyft: { type: Object, required: true, default: {} },
  lyftId: { type: String, default: '' },
})


schema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) {
      return next(err);
    } else {
      bcrypt.hash(user.password, salt, function (err, hash) {
        user.password = hash;
        next();
      });
    }
  });
});

schema.methods.validatePassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      if (err || !isMatch) {
        return reject(err);
      }
      return resolve(isMatch);
    });
  })
};

schema.methods.drink = function (drinkId) {
  var instance = this
  return new Promise((resolve, reject) => {
    instance.drinking.push({
      id: drinkId,
      drankAt: new Date()
    })
    instance.drunkLevel += .025
    instance.markModified('drinking')
    instance.save()
    resolve()
  })
};

schema.methods.updateStatus = function (message) {
  
    this.status = {
      message: message,
      setAt: new Date()
    }
    this.markModified('status')
    this.save()
    
};

schema.methods.decrementDrunkLevel = function () {
  // var instance = this
  // return new Promise((resolve, reject) => {
  var currentLevel = this.drunkLevel
  var newDrunkLevel = (currentLevel - .025)
  this.drunkLevel = newDrunkLevel
  this.save()
  socketManager.notify(this._id, 'update', this._id)
  // resolve()
  // })
};

schema.methods.setSpotify = function (spotifyCredentials) {
  console.log(spotifyCredentials)
  this.spotify = spotifyCredentials
  this.spotify.setAt = new Date()
  this.markModified('spotify')
  this.save()
};

schema.methods.setSpotifyId = function (spotifyId) {
  // console.log(spotifyCredentials)
  this.spotifyId = spotifyId
  this.save()
};


schema.methods.refreshSpotify = function (res) {

  var user = this
  return new Promise(function (resolve, reject) {

    request
      .post('https://accounts.spotify.com/api/token')
      .send({
        "grant_type": "refresh_token",
        "refresh_token": user.spotify.refresh_token,
        "redirect_uri": spotifyConfig.redirect
      }) // sends a JSON post body
      .auth(spotifyConfig.clientId, spotifyConfig.clientSecret)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // .set('Expect', '100-continue')
      // .set('accept', 'json')
      .end((error, response) => {
        if (error) {
          // sendStack(error)
          // console.log(error)
          console.log(error)
          res.status(500).send()
        }
        if (response) {
          console.log(response)
          // debugger
          resolve(response.body)
          user.setSpotify(response.body)
        }
      });
  })

};


schema.methods.fetchSpotifyTokens = function (code, res) {
  var instance = this
  return new Promise(function (resolve, reject) {

    request
      .post('https://accounts.spotify.com/api/token')
      .send({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": spotifyConfig.redirect
      }) // sends a JSON post body
      .auth(spotifyConfig.clientId, spotifyConfig.clientSecret)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // .set('Expect', '100-continue')
      // .set('accept', 'json')
      .end((error, response) => {
        if (error) {
          // sendStack(error)
          // console.log(error)
          console.log(error)
          res.status(500).send()
        }
        if (response) {
          // console.log(response)
          // debugger
          resolve(response.body)
        }
      });
  })
};

schema.methods.setLyft = function (lyftCredentials) {
  // debugger
  console.log(lyftCredentials)
  this.lyft = lyftCredentials
  this.lyft.setAt = new Date()
  this.markModified('lyft')
  this.save()
};

schema.methods.setLyftId = function (lyftId) {
  // console.log(spotifyCredentials)
  this.lyftId = lyftId
  this.save()
};

schema.methods.refreshLyft = function (res) {

  var user = this
  return new Promise(function (resolve, reject) {

    request
      .post('https://api.lyft.com/oauth/token')
      .send({
        "grant_type": "refresh_token",
        "refresh_token": user.lyft.refresh_token,
        "redirect_uri": lyftConfig.redirect
      }) // sends a JSON post body
      .auth(lyftConfig.clientId, lyftConfig.clientSecret)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // .set('Expect', '100-continue')
      // .set('accept', 'json')
      .end((error, response) => {
        if (error) {
          // sendStack(error)
          // console.log(error)
          user.setLyft({})
          console.log(error)
          res.status(500).send()
        }
        if (response) {
          console.log(response)
          // debugger
          resolve(response.body)
          user.setLyft(response.body)
        }
      });
  })

};


schema.methods.fetchLyftTokens = function (code, res) {
  var instance = this
  return new Promise(function (resolve, reject) {

    request
      .post('https://api.lyft.com/oauth/token')
      .send({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": lyftConfig.redirect
      }) // sends a JSON post body
      .auth(lyftConfig.clientId, lyftConfig.clientSecret)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // .set('Expect', '100-continue')
      // .set('accept', 'json')
      .end((error, response) => {
        if (error) {
          // sendStack(error)
          // console.log(error)
          console.log(error)
          res.status(500).send()
        }
        if (response) {
          // console.log(response)
          // debugger
          resolve(response.body)
        }
      });
  })
};

module.exports = mongoose.model('User', schema)