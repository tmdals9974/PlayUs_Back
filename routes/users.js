const router = require('express').Router();
const User = require('../models/user');
const Project = require('../models/project');
const { resResult, setTokenCookie } = require('../common');

router.get('/', (req, res) => {
    User.find({})
        .then((users) => {
            if (!users.length) return res.status(204).json(resResult(false, 'User not found'));
            res.json(resResult(true, undefined, users));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
});

router.post('/', (req, res) => {
    User.join(req.body)
        .then(user => res.status(201).json(resResult(true, undefined, user)))
        .catch(err => {
            if (err.code === 11000)
                res.status(409).json(resResult(false, '사용중인 이메일입니다.'));
            else res.status(500).json(resResult(false, undefined, err));
        });
});

router.delete('/:email', (req, res) => {
    User.findByIdAndDelete({ email: req.params.email })
        .then((user) => {
            if (!user) return res.status(404).json(resResult(false, 'User not found'));
            res.json(resResult(true));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
})

router.get('/check/:email', (req, res) => {
    User.findOne({ email: req.params.email })
        .then((user) => {
            if (!user) return res.status(204).json(resResult(false));
            res.json(resResult(true));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
})

router.post('/login', (req, res) => {
    User.login(req.body)
        .then((token) => {
            setTokenCookie(res, token);
            res.json(resResult(true));
        })
        .catch(err => {
            if (err.status)
                return res.status(err.status).json(resResult(false, err.msg));
            res.status(500).json(resResult(false, undefined, err));
        });
})

router.post('/logout', (req, res) => {
    setTokenCookie(res, null);
    res.json(resResult(true));
})

module.exports = router;