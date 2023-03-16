const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const moment = require('moment');
const { tokenTypes } = require('./tokens');
const config = require('./config');
const User = require('../models/user.model');
const { saveToken } = require('../services/token.service');

module.exports = function () {
  passport.use(
    'facebookToken',
    new FacebookTokenStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ id: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = new User({
            id: profile.id,
            email: profile.emails[0].value,
          });

          const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
          await saveToken(refreshToken, newUser.id, refreshTokenExpires, tokenTypes.REFRESH);

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
