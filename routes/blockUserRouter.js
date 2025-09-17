const express = require('express');
const authUser = require('../middlewares/authUser');
const Router = express.Router();
const {postAddBlock, postRemoveBlock} = require('../controllers/blockUser.controller');

Router.post('/add',authUser, postAddBlock);
Router.post('/remove',authUser, postRemoveBlock);

module.exports = Router;