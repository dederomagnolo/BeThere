const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const Command = require('../models/command');
const router = express.Router();

/* router.use(authMiddleWare); */

router.post('/laststatus' , async(req, res) => {
    const { categoryName } = req.body; 
    const lastCommand = await Command.find({categoryName}).sort( {createdAt: -1}).limit(1);
    res.send(lastCommand[0]);
});

router.post('/laststatus/all' , async(req, res) => {
    const wateringRoutineMode = await Command.find({categoryName: 'Watering Routine Mode'}).sort( {createdAt: -1}).limit(1);
    const autoPump = await Command.find({categoryName: 'Watering Routine Pump'}).sort( {createdAt: -1}).limit(1);
    const manualPump = await Command.find({categoryName: 'Manual Pump'}).sort( {createdAt: -1}).limit(1);
    res.send({
        wateringRoutineMode: wateringRoutineMode[0],
        autoPump: autoPump[0],
        manualPump: manualPump[0]
    });
});

module.exports = app => app.use('/commands', router);