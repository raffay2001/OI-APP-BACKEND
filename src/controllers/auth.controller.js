const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { generateAuthTokens } = require('../services/token.service');
const request = require('request');
const qs = require('querystring');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const facebookOAuth = async (req, res) => {
  if (!req.user) {
    return res.send(401, 'User not authenticated');
  }
  req.token = await generateAuthTokens(req.user);
  res.setHeader('x-auth-token', req.token.access.token);
  res.status(200).json(req.token);
};

const twitterOAuth = async (req, res) => {
  //URL To obtain Request Token from Twitter
  const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  //To be obtained from the app created on Twitter
  const CONSUMER_KEY = 'kuDm1KBKBJH3PpusFxcAA';
  const CONSUMER_SECRET = '5wOFqJe4R0Kf6SV9tXuqrzkpD7t7d8cvwZhPC7TW8';
  //Oauth Object to be used to obtain Request token from Twitter
  const oauth = {
    callback: 'http://localhost:3000/v1/auth/signin-with-twitter',
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
  };
  let oauthToken = '';
  let oauthTokenSecret = '';
  //Step-1 Obtaining a request token
  request.post({ url: requestTokenUrl, oauth: oauth }, function (e, r, body) {
    //Parsing the Query String containing the oauth_token and oauth_secret.
    const reqData = qs.parse(body);
    oauthToken = reqData.oauth_token;
    oauthTokenSecret = reqData.oauth_token_secret;
    //Step-2 Redirecting the user by creating a link and allowing the user to click the link
    const uri =
      'https://api.twitter.com/oauth/authenticate' +
      '?' +
      qs.stringify({ oauth_token: oauthToken, oauth_token_secret: oauthTokenSecret });
    res.status(200).json({ url: uri });
  });
};

const twitterOAuthCallback = async (req, res) => {
  const oauth = {};
  const authReqData = req.query;
  oauth.token = authReqData.oauth_token;
  oauth.token_secret = authReqData.oauth_token_secret;
  oauth.verifier = authReqData.oauth_verifier;
  const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';

  // Step-3 Converting the request token to an access token
  request.post({ url: accessTokenUrl, oauth: oauth }, function (e, r, body) {
    const authenticatedData = qs.parse(body);
    console.log(authenticatedData);
    // todo save authenticated Data in the database
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  facebookOAuth,
  twitterOAuth,
  twitterOAuthCallback,
};
