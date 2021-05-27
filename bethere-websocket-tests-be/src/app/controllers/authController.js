const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const authConfig = require('../../config/auth.json');

const User = require('../models/user');
const Device = require('../models/device');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400 // token to expire in one day
    });
}

router.post('/register', async (req, res)=> {
    const { username, email } = req.body;
    try {
        if(await User.findOne({ username })){
            return res.status(400).send({ error: 'User already exists!'});
        };

        if(!username || !email) {
            return res.status(400).send({error: 'Username/Email/Password is required'});
        }
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({user, token: generateToken({ id: user.id })});
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

router.post('/authenticate' , async (req, res) => {
    const { username, password } = req.body;

    // precisa do password para autenticar, mas está no schema select false
    const user = await User.findOne({ username }).select('password');
    if(!user) {
        return res.status(400).send({ error: 'User not found!'});
    }

    if(!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password!'});
    }

    user.password = undefined;
    const userId = user._id;

    const userDevices = await Device.find({userId}).populate('settings');

    res.send({ 
        user: {
            _id: userId,
            devices: userDevices,
        }, 
        token: generateToken({id: user.id}
    )});
});

// only for tests
router.post('/clear' , async (req, res) => { 
    await User.collection.drop();
    res.send({
        message: "user collection cleared"
    });
});

router.get('/all' , async (req, res) => {
    try {
        const users = await User.find().select(["-__v"]);
        res.send({ users });
    } catch(err) {
        return res.status(400).send({ error: err.message});
    }
});

module.exports = app => app.use('/auth', router);