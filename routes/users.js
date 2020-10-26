const router = require('express').Router();
const User = require('../models/user');

router.get('/', (req, res) => {
    User.find({})
        .then((users) => {
            if (!users.length) return res.status(404).send({ err: 'User not found' });
            res.send(`find successfully: ${users}`);
        })
        .catch(err => res.status(500).send(err));
});

router.get('/userId/:id', (req, res) => {
    User.findOne({ id : req.params.id})
        .then((user) => {
            if (!user) return res.status(404).send({ err: 'User not found' });
            res.send(`findOne successfully: ${user}`);
        })
        .catch(err => res.status(500).send(err));
});

router.post('/', (req, res) => {
    new User({...req.body}).save()
        .then(user => res.send(user))
        .catch(err => { res.status(500).send(err) });
});

router.put('/userId/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(user => res.send(user))
        .catch(err => res.status(500).send(err));
});

router.delete('/userId/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(() => res.sendStatus(200).send(1))
        .catch(err => res.status(500).send(err));
});

module.exports = router;