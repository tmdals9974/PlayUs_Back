const router = require('express').Router();
const User = require('../models/user');

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
        .then((result) => {
            if (!result) return res.status(401).json(resResult(false, 'Password Mismatch'));
            res.json(resResult(true));
        })
        .catch(err => res.status(500).send(err));
})

function resResult(success, msg, details) {
    return {
        success, msg, details
    }
}

module.exports = router;