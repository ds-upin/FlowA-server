const express = require('express');
const authUser = require('../middlewares/authUser');
const Router = express.Router();
const {getPendingMessages}=require('../controllers/PendingMessage.controller');
Router.get('/',authUser,getPendingMessages);
module.exports = Router;