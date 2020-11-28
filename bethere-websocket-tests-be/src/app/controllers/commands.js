const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const Command = require('../models/command');
const router = express.Router();

/* router.use(authMiddleWare); */

router.get('/pumpstatus' , async (req, res) => {
    const lastCommand = await Command.find({ commandName: "Pump Status"}).sort( { createdAt: -1 }).limit(1);
    res.send(lastCommand[0]);
})

router.get('/backlight' , async(req, res) => {
    const lastCommand = await Command.find({ commandName: "Backlight"}).sort( { createdAt: -1 }).limit(1);
    res.send(lastCommand[0]);
})

module.exports = app => app.use('/commands', router);