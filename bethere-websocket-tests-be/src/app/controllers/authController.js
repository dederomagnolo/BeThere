const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400 // token to expire in one day
    });
}

router.post('/register', async (req, res)=> {
    const { username } = req.body;
    try {
        if(await User.findOne({ username })){
            return res.status(400).send({ error: 'User already exists!'});
        };
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

    res.send({ 
        user, 
        token: generateToken({id: user.id}
    )});
});

router.post('/clear' , async (req, res) => { 
    await User.collection.drop();

    res.send({
        message: "user collection cleared"
    })
});

module.exports = app => app.use('/auth', router);