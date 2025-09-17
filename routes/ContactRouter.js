const express = require('express');
const authUser = require('../middlewares/authUser');
const Router = express.Router();
const { getListAllContact, addToContact,removeContact,addToContactAsList } = require('../controllers/contact.controller');

Router.get('/',authUser, getListAllContact);
Router.post('/add',authUser, addToContact);
Router.post('/addList',authUser, addToContactAsList);
Router.post('/remove',authUser, removeContact);

module.exports = Router;