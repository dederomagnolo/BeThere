const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const Device = require('../models/device');
const router = express.Router();

/* router.use(authMiddleWare); */

router.post('/user-devices' , async(req, res) => {
    const { userId } = req.body;
    const userDevices = await Device.find({userId});
    return res.send(userDevices);
})

module.exports = app => app.use('/devices', router);