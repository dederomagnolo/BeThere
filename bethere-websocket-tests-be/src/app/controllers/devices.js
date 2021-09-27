const express = require('express');
const _ = require('lodash');

const authMiddleWare = require('../middlewares/auth');
const {generateProductKey} = require('../../utils');
const User = require('../models/user');
const Device = require('../models/device');
const Settings = require('../models/settings');
const router = express.Router();

/* router.use(authMiddleWare);
 */
router.post('/verify' , async(req, res) => {
    const {deviceSerialKey} = req.body;
    const device = await Device.find({deviceSerialKey, available: true});
    if(device && device.length > 0) {
        return res.send("Device is available");
    }
    return res.status(400).send("This serial key is not available");
});

router.post('/new' , async (req, res) => {
    try {
        const { deviceSerialKey, email, deviceName } = req.body; 
        const productAvailable = await Device.find({deviceSerialKey, available: true});     

        if(_.isEmpty(productAvailable)) {
            return res.status(400).send("Device already registered or invalid serial key");
        }
        const user = await User.findOne({email});

        if(productAvailable && productAvailable.length > 0 && user) {
            const planType = _.get(productAvailable, '[0].planType');
            const deviceId = _.get(productAvailable, '[0]._id'); 
            // associate valid user with device in bd
            const newDeviceData = {
                planType,
                deviceId,
                deviceName,
                userId: user._id,
                available: false
            }

            const newDevice = await Device.findOneAndUpdate({deviceSerialKey}, {...newDeviceData});

            
            // add default settings to a device
            const defaultSettings = {
                userId: user._id,
                deviceId: newDeviceData.deviceId
            }

            const newDeviceSettings = await Settings.create(defaultSettings);
            newDevice.settings.push(newDeviceSettings);
            await newDevice.save();
            
            //const devices = user.devices.push(newDevice);
            await User.findOneAndUpdate({email}, {devices: [...user.devices, newDevice]});
            await Device.findOneAndUpdate({deviceSerialKey}, {available: false});
            return res.send("Device assignated to user with success"); 
        } else {
            res.status(400).send("Device is not available!");
        }
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

// only for test
router.post('/populate' , async(req, res) => {
    const {serialKey} = req.body;
    let newSerialKey;
    if(!serialKey) {
        newSerialKey = generateProductKey();
    } else {
        newSerialKey = serialKey;
    }
    
    const device = await Device.findOne({deviceSerialKey: newSerialKey});
    
    if(device) {
        return res.status(400).send("Serial already in use!");
    }

    const myDevice = {
        deviceSerialKey: newSerialKey,
        planType: "BeThere Starter",
    }

    await Device(myDevice).save();
    return res.send({ message: `Device ${newSerialKey} added to database. Plan: ${myDevice.planType}`});
});

// only for test
router.post('/populate/clear' , async(req, res) => {
    try{
        await Device.collection.drop();
        return res.send({message: "Devices collection cleared!"});
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }  
});

// all catalog
router.get('/all' , async (req, res) => {
    try {
        const devices = await Device.find().select(["-__v"]);
        res.send({ devices });
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

router.post('/select-default', async(req, res) => {
    const { deviceId, userId, defaultDevice } = req.body;

    const user = await User.findOne({userId});
    const device = await Device.findOne({deviceId});

    // check if user and device exists
    if(!user) return res.send({message: "Usuário não encontrado", error: true});
    if(!device) return res.send({message: "Dispositivo não encontrado", error: true});

    // check if the device is assigned to this user
    const userDevices = _.get(user, 'devices');
    let isDeviceFromThisUser;
    if(userDevices.length > 0) {
        isDeviceFromThisUser = userDevices.indexOf(deviceId);
    }

    if(isDeviceFromThisUser === -1)
        return res.send({true: true, message: "Operação não autorizada"});

    await Device.findOneAndUpdate({deviceId}, { defaultDevice })
    
    return res.send({message: `${device.deviceSerialKey} agora é o dispositivo padrão`, error: false});
});

router.post('/user-devices' , async(req, res) => {
    const { userId } = req.body;
    const userDevices = await Device.find({userId}).populate("settings");
    return res.send(userDevices);
});

module.exports = app => app.use('/devices', router);