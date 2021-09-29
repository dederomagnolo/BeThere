const express = require('express');
const authMiddleWare = require('../middlewares/auth');
const moment = require('moment');
const Command = require('../models/command');
const router = express.Router();
const tz = require('moment-timezone');
const COMMANDS = require('../../utils/consts');

/* router.use(authMiddleWare); */

router.post('/laststatus' , async(req, res) => {
    const { categoryName } = req.body; 
    const lastCommand = await Command.find({categoryName}).sort( {createdAt: -1}).limit(1);
    res.send(lastCommand[0]);
});

router.post('/laststatus/all' , async(req, res) => {
    const wateringRoutineMode = await Command.find({categoryName: COMMANDS.WATERING_ROUTINE_MODE.NAME}).sort( {createdAt: -1}).limit(1);
    const autoPump = await Command.find({categoryName: COMMANDS.WATERING_ROUTINE_PUMP.NAME}).sort( {createdAt: -1}).limit(1);
    const manualPump = await Command.find({categoryName: COMMANDS.MANUAL_PUMP.NAME}).sort( {createdAt: -1}).limit(1);
    res.send({
        wateringRoutineMode: wateringRoutineMode[0],
        autoPump: autoPump[0],
        manualPump: manualPump[0]
    });
});

router.post('/history', async(req, res) => {
    const { dayToRetrieveHistory } = req.body;
    const historyForDate = await Command.find({ 
        createdAt: { 
            $gte: dayToRetrieveHistory, 
        }  
    });
    res.send({
        historyForDate
    });
})

module.exports = app => app.use('/commands', router);