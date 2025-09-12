const express = require('express');
const Router = express.Router();
const {
    postRegister,
    postLogin,
    postLogout,
    getMe
} = require('../controllers/auth.controller');

Router.post('register',postRegister);
Router.post('/login',postLogin);
Router.post('/logout',postLogout);
Router.get('/me',getMe);

module.exports = Router;