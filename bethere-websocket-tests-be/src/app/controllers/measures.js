const express = require('express');
const authMiddleWare = require('../middlewares/auth');

const Measure = require('../models/measure');
const router = express.Router();

/* router.use(authMiddleWare); */

router.get('/pumpstatus' , async (req, res) => {
    const lastMeasure = await Measure.find( { measureName: "Pump Status"}).sort( { _id: -1 }).limit(1);

    res.send(lastMeasure[0]);
})

module.exports = app => app.use('/measures', router);