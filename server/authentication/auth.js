let router = require('express').Router()
let Users = require('../models/user')
let socketManager = require('../config/dev-server').socketManager
let spotify = require('../services/spotify/spotify.js')

function handleError(err, res) {
  res.statusMessage = err.message
  res.status(400).end();
}

router.post('/register', (req, res) => {
  console.log(req)
  Users.create(req.body)
    .then((user) => {
      req.session.uid = user._id
      req.session.save()
      res.send({
        message: 'Successfully created user account. Welcome to the party.',
        data: user
      })
    })
    .catch(err => {
     handleError(err, res)
    })
})


router.post('/login', (req, res) => {
  console.log(req)
  Users.findOne({ username: req.body.username })
    .then(user => {
      user.validatePassword(req.body.password)
        .then(valid => {
          if (!valid) {
            return res.send({ error: 'Invalid Email or Password' })
          }
          req.session.uid = user._id;
          req.session.username = user.username;
          req.session.save()

          res.send({
            message: 'successfully logged in',
            data: user
          })
        })
        .catch(err => {
          handleError(err, res)
        })
    })
    .catch(err => {
      handleError(err, res)
    })
})

router.delete('/logout', (req, res) => {
  req.session.destroy()
  res.send({
    message: 'You have successfully been logged out. Please come back soon!'
  })
})


router.get('/authenticate', (req, res) => {
  Users.findById(req.session.uid).then(user => {
    res.send({
      data: user
    })
  }).catch(err => {
    handleError(err, res)
  })
})

// router.get('/websocketauth', (req, res) => {
//   Users.findById(req.session.uid).then(user => {
//     socketManager.validate(user._id)
//     debugger
//     res.send()
//   }).catch(err => {
//     handleError(err, res)
//   })
// })

router.get('/spotifyauth', spotify.passport.authenticate('spotify'), function(req, res) {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
});


module.exports = router