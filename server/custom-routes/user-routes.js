let Users = require('../models/user')
let drinkAPI = require('../services/drinkAPI/drinkAPI.js')
let socketManager = require('../services/websocket/socketManager.js')
let spotify = require('../services/spotify/spotify.js')
let lyftConfig = require('../services/lyft/lyft.js').config

function handleError(err, res) {
    res.statusMessage = err.message
    res.status(400).end();
}

module.exports = {
    userData: {
        path: '/',
        reqType: 'get',
        method(req, res, next) {
            let action = 'Find Users'
            Users.find({ _id: req.session.uid })
                .then(user => {
                    res.send(handleResponse(action, user))
                }).catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    userProperties: {
        path: '/users/:userId',
        reqType: 'put',
        method(req, res, next) {
            let action = 'Update User Info'
            Users.findByIdAndUpdate(req.params.userId, req.body)
                .then(user => {
                    res.send(handleResponse(action, user))//send updated user info to store
                }).catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    drink: {
        path: '/users/:userId/drink/:drinkId',
        reqType: 'put',
        method(req, res, next) {
            let action = 'Update User Info'
            Users.findByIdAndUpdate(req.params.userId, req.body)
                .then(user => {
                    user.drink(req.params.drinkId).then((result) => {
                        res.send()
                    }).catch((err) => {
                        handleError(err, res)
                    })
                }).catch(error => {
                    handleError(err, res)
                })
        }
    },

    searchUsers: {
        path: '/friends/',
        reqType: 'post',
        method(req, res, next) {
            // console.log(req.body)
            var search = req.body.search
            Users.find({
                $or: [
                    { 'firstname': search },
                    { 'lastname': search },
                    { 'username': search },
                    { 'email': search },
                ],
            })
                .then(users => {
                    // console.log(users)
                    res.send({
                        data: users
                    })

                }).catch(error => {
                    handleError(error, res)
                })
        }
    },

    friends: {
        path: '/friends/:userId',
        reqType: 'put',
        method(req, res, next) {
            let action = 'Add/Remove Friends'
            var request = {
                sent: new Date(),
                to: req.params.userId,
                from: req.session.uid,
                new: true
            }
            Users.findById(req.params.userId)
                .then(user => {
                    user.requests.push(request)
                    user.save()
                        .then(() => {
                            socketManager.notify(user._id, 'update', user._id)
                            Users.findById(req.session.uid)
                                .then(sender => {
                                    sender.requests.push(request)
                                    sender.save()
                                        .then(() => {
                                            socketManager.notify(sender._id, 'update', sender._id)
                                            res.send()
                                        }).catch(error => {
                                            handleError(error, res)
                                        })
                                }).catch(error => {
                                    handleError(error, res)
                                })
                        }).catch(error => {
                            handleError(error, res)
                        })
                }).catch(error => {
                    handleError(error, res)
                })
        }
    },

    findPersonById: {
        path: '/friends/:userId',
        reqType: 'get',
        method(req, res, next) {
            let action = 'Populate friend requests'
            Users.findById(req.params.userId)
                .then(user => {
                    res.send({
                        data: user
                    })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    spotifyAuth: {
        path: '/users/:userId/spotifyauth',
        reqType: 'post',
        method(req, res, next) {
            let action = 'Handle Lyft Auth'
            Users.findById(req.session.uid)
                .then(user => {
                    user.fetchSpotifyTokens(req.body.code, res).then((result) => {
                        console.log(result)
                        user.setSpotify(result)
                        res.send()
                    }).catch((err) => {
                        console.log(err)
                    })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    lyftAuth: {
        path: '/users/:userId/lyftauth',
        reqType: 'post',
        method(req, res, next) {
            let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.fetchLyftTokens(req.body.code, res).then((result) => {
                        console.log(result)
                        user.setLyft(result)
                        res.send()
                    }).catch((err) => {
                        console.log(err)
                    })
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    dispositionRequest: {
        path: '/friends/:userId/:action',
        reqType: 'put',
        method(req, res, next) {
            if (req.params.action == 'accept') {
                Users.findById(req.session.uid)
                    .then(user => {
                        var requests = user.requests
                        var targetIndex = requests.findIndex(request => request.from == req.params.userId)
                        user.requests.splice(targetIndex, 1);
                        user.friends.push({
                            id: req.params.userId,
                            since: new Date()
                        })
                        user.markModified('friends'),
                            user.markModified('requests')
                        user.save()
                            .then(() => {
                                socketManager.notify(user._id, 'update', user._id)
                                Users.findById(req.params.userId)
                                    .then(sender => {
                                        // sender.requests.push(request)
                                        var senderRequests = sender.requests
                                        var targetSenderIndex = senderRequests.findIndex(request => request.to == req.session.uid)
                                        sender.requests.splice(targetSenderIndex, 1);
                                        sender.friends.push({
                                            id: req.session.uid,
                                            since: new Date()
                                        })
                                        sender.markModified('friends'),
                                            sender.markModified('senderRequests')

                                        sender.save()
                                            .then(() => {
                                                socketManager.notify(sender._id, 'update', sender._id)
                                                res.send()
                                            }).catch(error => {
                                                handleError(error, res)
                                            })
                                    }).catch(error => {
                                        handleError(error, res)
                                    })
                            }).catch(error => {
                                handleError(error, res)
                            })
                    }).catch(error => {
                        handleError(error, res)
                    })
            }
            if (req.params.action == 'reject') {
                Users.findById(req.session.uid)
                    .then(user => {
                        var requests = user.requests
                        var targetIndex = requests.findIndex(request => request.from == req.params.userId)
                        user.requests.splice(targetIndex, 1);
                        var friendIndex = user.friends.findIndex(friend => friend.id == req.params.userId)
                        user.friends.splice(friendIndex, 1)
                        user.markModified('friends'),
                            user.markModified('requests')

                        user.save()
                            .then(() => {
                                socketManager.notify(req.session.uid, 'update', req.session.uid)
                                Users.findById(req.params.userId)
                                    .then(sender => {
                                        // sender.requests.push(request)
                                        var senderRequests = sender.requests
                                        var targetSenderIndex = senderRequests.findIndex(request => request.to == req.session.uid)
                                        sender.requests.splice(targetSenderIndex, 1);
                                        var senderFriendIndex = sender.friends.findIndex(friend => friend.id == req.session.uid)
                                        sender.friends.splice(friendIndex, 1)
                                        sender.markModified('friends'),
                                            sender.markModified('senderRequests')

                                        sender.save()
                                            .then(() => {
                                                socketManager.notify(req.params.userId, 'update', req.params.userId)
                                                res.send()
                                            }).catch(error => {
                                                handleError(error, res)
                                            })
                                    }).catch(error => {
                                        handleError(error, res)
                                    })
                            }).catch(error => {
                                handleError(error, res)
                            })
                    }).catch(error => {
                        handleError(error, res)
                    })
            }
        }
    },

    getMySpotify: {
        path: '/spotify/:userId/',
        reqType: 'get',
        method(req, res, next) {
            let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    var credentials = user.spotify
                    if (credentials) {

                        spotify.request('/me/', credentials).then((result) => {
                            console.log(result)
                        }).catch((err) => {
                            console.log(err)
                        })

                    } else {
                        var error = {
                            message: 'User is not authenticated with Spotify.'
                        }
                        handleError(error, res)
                    }
                })
                .catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },

    refreshSpotify: {
        path: '/spotify/:userId/',
        reqType: 'put',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.refreshSpotify(res).then((result) => {
                        console.log(result)
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

    refreshLyft: {
        path: '/lyft/:userId/',
        reqType: 'put',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.refreshLyft(res).then((result) => {
                        console.log(result)
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

    terminateLyft: {
        path: '/lyft/:userId/',
        reqType: 'delete',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.setLyft({})
                    res.send()
                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    lyftETA: {
        path: '/lyft/:userId/eta',
        reqType: 'post',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    let lyft = require('node-lyft');
                    let defaultClient = lyft.ApiClient.instance;
                    defaultClient.authentications['Client Authentication'].accessToken = lyftConfig.accessToken
                    defaultClient.authentications['User Authentication'].accessToken = user.lyft.access_token
                    var lyftPublicApi = new lyft.PublicApi()
                    //the getETA endpoint works with both user and non-user context:
                    //leaving the options field empty {}
                    //and using promises/then to print out result
                    lyftPublicApi.getETA(req.body.lat, req.body.lon, {}).then((data) => {
                        //   console.log('API called successfully. Returned data: ' + data);
                        res.send({
                            data: data
                        })
                    }, (error) => {
                        console.error(error);
                        handleError(error, res)
                    });

                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    lyftEstimate: {
        path: '/lyft/:userId/estimate',
        reqType: 'post',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    let lyft = require('node-lyft');
                    let defaultClient = lyft.ApiClient.instance;
                    defaultClient.authentications['Client Authentication'].accessToken = lyftConfig.accessToken
                    defaultClient.authentications['User Authentication'].accessToken = user.lyft.access_token
                    var lyftPublicApi = new lyft.PublicApi()
                    //the getETA endpoint works with both user and non-user context:
                    //leaving the options field empty {}
                    //and using promises/then to print out result

                    let opts = {
                        'rideType': req.body.ride_type, // String | ID of a ride type
                        'endLat': req.body.arriveLat, // Number | Latitude of the ending location
                        'endLng': req.body.arriveLon // Number | Longitude of the ending location
                    };
// debugger
                    lyftPublicApi.getCost(req.body.departLat, req.body.departLon, opts).then((data) => {
                        //   console.log('API called successfully. Returned data: ' + data);
                        res.send({
                            data: data
                        })
                    }, (error) => {
                        console.error(error);
                        handleError(error, res)
                    });

                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    setLyftId: {
        path: '/lyft/setlyftid/:userId/',
        reqType: 'put',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.setLyftId(req.params.userId)
                    res.send()
                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    terminateSpotify: {
        path: '/spotify/:userId/',
        reqType: 'delete',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.setSpotify({})
                    res.send()
                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    setSpotifyId: {
        path: '/spotify/setspotifyid/:userId/',
        reqType: 'put',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.setSpotifyId(req.params.userId)
                    res.send()
                })
                .catch(error => {
                    handleError(error, res)
                })
        }
    },

    updateStatus: {
        path: '/users/:userId/status',
        reqType: 'post',
        method(req, res, next) {
            // let action = 'Populate friend requests'
            Users.findById(req.session.uid)
                .then(user => {
                    user.updateStatus(req.body.status)
                    res.send()
                })
                .catch(error => {
                    handleError(error, res)
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