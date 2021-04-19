const express = require('express');
const _ = require('lodash');

const authMiddleWare = require('../middlewares/auth');

const User = require('../models/user');
const Device = require('../models/device');
const Product = require('../models/product');
const Settings = require('../models/settings');
const router = express.Router();

/* router.use(authMiddleWare);
 */
router.post('/verify-device' , async(req, res) => {
    const {deviceSerialKey} = req.body;
    const device = await Product.find({deviceSerialKey});
    if(device && device.length > 0) {
        return res.send("Device is available");
    }
    return res.status(400).send("This serial key is not available");
});

router.post('/new-device' , async(req, res) => {
    try {
        const { deviceSerialKey, email, deviceName } = req.body; 
        const productAvailable = await Product.find({deviceSerialKey, available: true});
        console.log(productAvailable);
        
        if(_.isEmpty(productAvailable) || !productAvailable) {
            return res.status(400).send("Device already registered or invalid serial key");
        }

        const user = await User.findOne({email});
        console.log(user);

        if(productAvailable && productAvailable.length > 0 && user) {
            const serialKey = productAvailable[0].deviceSerialKey;
            const existingDevice = await Device.find({deviceSerialKey: serialKey});
            
            if(existingDevice && existingDevice.length > 0) {
                return res.status(400).send("Device already registered");
            }

            const newDeviceData = {
                deviceName,
                deviceSerialKey: productAvailable[0].deviceSerialKey,
                userId: user._id
            }

            const newDevice = await Device.create(newDeviceData);
            const test = await newDevice.save(
                newDevice
            );
            const defaultSettings = {
                userId: user._id,
                deviceId: newDevice._id
            }

            const newDeviceSettings = await Settings.create(defaultSettings);
            newDevice.settings.push(newDeviceSettings);
            newDevice.save();
            
            user.devices.push(test);
            user.save();
            await Product.findOneAndUpdate({deviceSerialKey}, {available: false});
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
    const deviceSerialKey = "7GGBK-5TYH4-R4NBD-V06GB" // here I need to put a verification to not duplicate serial keys for the final route
    const product = Product.findOne({deviceSerialKey});
    
    if(product) {
        return res.status(400).send("Serial already in use!");
    }

    const myDevice = {
        deviceSerialKey,
        planType: "BeThere Starter",
    }

    await Product(myDevice).save();
    return res.send({ message: 'Device added to database'});
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
// only for test
router.get('/products/clear' , async (req, res) => {
    try {
        await Product.collection.drop();
        return res.send({message: "Products collection cleared!"});
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

//catalog
router.get('/products' , async (req, res) => {
    try {
        const products = await Product.find().select(["-__v"]);
        res.send({ products });
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

module.exports = app => app.use('/register', router);