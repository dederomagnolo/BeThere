const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const User = require('../models/user');
const Device = require('../models/device');
const Settings = require('../models/settings');
const router = express.Router();

/* router.use(authMiddleWare); */
router.post('/' , async(req, res) => { 
    try {
        const { deviceId } = req.body;
        const settingsFromDevice = await Settings.find({deviceId});
        return res.send({settingsFromDevice});
    } catch (err) {
        return res.status(400).send({ error: err.message});
    }
});

router.post('/new' , async(req, res) => {
    try {
        const { 
            userId, 
            deviceId, 
            settingsName, 
            backlight, 
            pumpTimer, 
            localMeasureInterval, 
            remoteMeasureInterval
        } = req.body; 
        const user = await User.find({_id: userId});
        const device = await Device.find({_id: deviceId});
        // need to match device with user here, before to create the new setting
        if(user && device) {
            await Settings.create({ 
                deviceId, 
                settingsName, 
                backlight, 
                pumpTimer, 
                localMeasureInterval, 
                remoteMeasureInterval
            });
            return res.send("Created with success"); 
        } else {
            res.status(400).send("User or device not found");
        }
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

router.post('/edit' , async(req, res) => {
    try {
        const {
            deviceId,
            settingsName, 
            backlight, 
            pumpTimer, 
            localMeasureInterval, 
            remoteMeasureInterval
        } = req.body;

        const dataToUpdate = {
            settingsName,
            backlight,
            pumpTimer,
            localMeasureInterval,
            remoteMeasureInterval
        }

        await Settings.findOneAndUpdate({_id: deviceId}, {
            $set: dataToUpdate
        });

        res.status(200).send("Updated!");

    } catch (err) {

    }
})

module.exports = app => app.use('/settings', router);