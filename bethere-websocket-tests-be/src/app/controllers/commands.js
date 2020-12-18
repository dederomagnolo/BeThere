const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const Command = require('../models/command');
const router = express.Router();

/* router.use(authMiddleWare); */

router.post('/laststatus' , async(req, res) => {
    const { commandName } = req.body; 
    const lastCommand = await Command.find({commandName}).sort( {createdAt: -1}).limit(1);
    res.send(lastCommand[0]);
})

module.exports = app => app.use('/commands', router);