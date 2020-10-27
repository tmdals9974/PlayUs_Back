const router = require('express').Router();
const User = require('../models/user');
const resResult = require('../models/resResult');

router.get('/', (req, res) => {
    User.find({})
        .then((users) => {
            if (!users.length) return res.status(204).send(resResult(false, 'User not found'));
            res.json(resResult(true, null, users));
        })
        .catch(err => res.status(500).send(err));
});

router.post('/', (req, res) => {
    User.join(req.body)
        .then(user => res.status(201).json(resResult(true, null, user)))
        .catch(err => res.status(500).send(err));
});

router.delete('/:email', (req, res) => {
    User.findByIdAndDelete({ email: req.params.email })
        .then((user) => {
            if (!user) return res.status(404).json(resResult(false, 'User not found'));
            res.json(resResult(true));
        })
        .catch(err => res.status(500).send(err));
})

router.get('/check/:email', (req, res) => {
    User.findOne({ email: req.params.email })
        .then((user) => {
            if (!user) return res.status(409).json(resResult(false));
            res.json(resResult(true));
        })
        .catch(err => res.status(500).send(err));
})

router.post('/login', (req, res) => {
    User.login(req.body)
        .then((token) => {
            res.cookie("access_token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }).send(resResult(true))
        })
        .catch(err => {
            if (err.status)
                return res.status(err.status).send(err.msg);
            res.status(500).send(err);
        });
})

router.post('/logout', (req, res) => {
    res.cookie("access_token", null, { httpOnly: true, maxAge: 0 }).send(resResult(true));
})

module.exports = router;