const express = require('express');
const Router = express.Router();
const {
    postRegister,
    postLogin,
    postLogout,
    getMe,
    postVerifyEmail,
} = require('../controllers/auth.controller');

Router.post('register',postRegister);
Router.post('/login',postLogin);
Router.post('/logout',postLogout);
Router.post('/verify',postVerifyEmail);
Router.get('/me',getMe);

module.exports = Router;