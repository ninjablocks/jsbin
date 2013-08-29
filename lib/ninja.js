var passport       = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

var setup = function(options) {
  passport.use(new GitHubStrategy({
      clientID: options.github.id,
      clientSecret: options.github.secret,
      authorizationURL : 'https://api.ninja.is/oauth/authorize',
      tokenURL : 'https://api.ninja.is/oauth/access_token',
      userProfileURL : 'https://api.ninja.is/rest/v0/user',
      callbackURL: 'http'+(options.url.ssl?'s':'')+'://'+options.url.host+'/auth/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      // Delete information we don't need that will fill up the cookie jar
      //
      //      .---------------------------.
      //      /_   _   _         __  __   /|
      //     // \ / \ / \ |_/ | |_  (_   / |
      //    / \_  \_/ \_/ | \ | |__ ,_/ /  |
      //   :.__________________________/   /
      //   |  .--. .--.   .--.   .--.  |  /
      //   | (    )    ) (    ) (    ) | /
      //   |  '--' '--'   '--'   '--'  |/
      //   '---------------------------'
      //
      profile.email = profile._json.email;
      profile.username = profile._json.id;
      profile.pusherChannel = profile._json.pusherChannel;
      profile.pusherKey = profile._json.pusherKey;
      delete profile._raw;
      delete profile._json;
      delete profile.photos;
      return done(null, {
        access_token: accessToken,
        profile: profile
      });
    }
  ));
}

module.exports = function (options) {
  /**
   * Passport configuration
   */

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });


  if (options.github && options.github.id) {
    setup(options);
    return {
      initialize: function (app) {
        app.use(passport.initialize());
      }
    };
  } else {
    return {
      initialize: function () {
        console.log('doing nothing');
      }
    };
  }
};
