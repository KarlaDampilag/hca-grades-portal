const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const APP_SECRET = 'sdlfkj08234lksdf'; // move to env

router.get('/login', (req, res) => {

});

router.post('/createUser', (req, res) => {
    bcrypt.hash(req.body.password, 10, (error, hash) => {
        if (error) {
            res.status(500).json(error);
        } else {
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash,
                role: req.body.role
            });

            newUser.save()
            .then(user => {
                res.cookie('token', generateToken(user));
                res.status(200).end();
            })
            .catch(err => {
                res.status(500).json(err);
            })
        }
    });
});

const generateToken = (user) => {
    return jwt.sign({ data: user }, APP_SECRET, { expiresIn: '24h' });
}

module.exports = router;