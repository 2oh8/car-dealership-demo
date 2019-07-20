var SpotifyWebApi = require('spotify-web-api-node');
const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const request = require('superagent')

const config = {
    clientId: '635979c4c8b740568024bd5d857f2fec',
    clientSecret: '7955d8b7c4e6485d83d3cb83cf1c0731',
    redirect: 'https://afterhrs.herokuapp.com/#/spotify',
    accessToken: 'BQAWsR_N9rS1ZWljtkj1l2Z1sIG8CrCM90EqPyfLPfmEXkdJNbNVA7GepKkaq3-bXW_-8uutJzFgmR2G75Iorneeid2WvxNGN195guJk3tzmY4kf4wM4zAlyKBX6iyr-olH4FbXsKgJwNh-dAVFl_MlKJGu96Ij_g4lq_LcvH5G9FZMciDodSFA6TPD-'
}

passport.use(
    new SpotifyStrategy(
        {
            clientID: config.clientId,
            clientSecret: config.clientSecret,
            callbackURL: config.redirect
        },
        function (accessToken, refreshToken, expires_in, profile, done) {
            User.findOrCreate({ spotifyId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }
    )
);

var spotify = {

    // credentials are optional
    webApi: new SpotifyWebApi({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirect
    }),
    // console.log(spotifyApi)
    passport: passport,
    config: config,
    request: function (route, credentials) {
        return new Promise(function (resolve, reject) {
            request
                .post('https://api.spotify.com/v1/' + route)
                .send({
                    "Authorization": "Bearer " + credentials.token,
                    // "code": code,
                    "redirect_uri": config.redirect
                }) // sends a JSON post body
                .auth(config.clientId, config.clientSecret)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                // .set('Expect', '100-continue')
                // .set('accept', 'json')
                .end((error, response) => {
                    if (error) {
                        console.log(error)
                        reject(error)
                    }
                    if (response) {
                        resolve(response.body)
                    }
                })
        })
    }

}

spotify.webApi.setAccessToken(config.accessToken);

module.exports = spotify