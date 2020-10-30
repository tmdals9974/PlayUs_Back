const router = require('express').Router();
const Project = require('../models/project');
const { resResult, verifyToken } = require('../common');

router.get('/', verifyToken, (req, res) => {
    Project.find({ user: req.user._id })
        .then((projects) => {
            if (!projects.length) return res.status(204).json(resResult(false, 'Project not found'));
            res.json(resResult(true, undefined, projects));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
});

router.post('/', verifyToken, (req, res) => {
    new Project({ user: req.user._id, ...req.body }).save()
        .then(project => res.json(resResult(true, undefined, project)))
        .catch(err => {
            if (err.code === 11000) res.status(409).json(resResult(false, '동일한 프로젝트 이름이 존재합니다.'));
            else res.status(500).json(resResult(false, undefined, err));
        });
});

router.delete('/:id', verifyToken, (req, res) => {
    Project.findOneAndRemove({ _id: req.params.id })
        .then((project) => { 
            if (!project) res.json(resResult(false, 'Project not found'));
            res.json(resResult(true, undefined, project));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
})

module.exports = router;