const router = require('express').Router();
const Project = require('../models/project');
const { getConnections, resResult, verifyToken } = require('../common');

router.get('/', verifyToken, (req, res) => {
    Project.find({ user: req.user._id })
        .then((projects) => {
            if (!projects.length) return res.status(204).json(resResult(false, 'Project not found'));
            projects.forEach((project, index) => projects[index] = project.getPublicFields());
            res.json(resResult(true, undefined, projects));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
});

router.post('/', verifyToken, async (req, res) => {
    new Project({ user: req.user._id, ...req.body }).save()
        .then(project => {
            res.json(resResult(true, undefined, project.getPublicFields()));
        })
        .catch(err => {
            if (err.code === 11000) res.status(409).json(resResult(false, '동일한 프로젝트 이름이 존재합니다.'));
            else res.status(500).json(resResult(false, undefined, err));
        });
});

router.get('/stats', verifyToken, (req, res) => {
    Project.find({ user: req.user._id }, '_id')
        .then(async (projects) => {
            if (!projects) res.json(resResult(false, 'Project not found'));
            var stats = [];
            for (const index in projects) {
                var mongo = await getConnections((projects[index]._id).toString());
                var stat = await mongo.stats();
                stats.push(stat);
                delete stat, mongo;
            }
            res.json(resResult(true, undefined, stats));
        })
        .catch(err => { console.log('err : ' + err); res.status(500).json(resResult(false, undefined, err)) });
})



router.delete('/:projectId', verifyToken, (req, res) => {
    Project.findOneAndRemove({ _id: req.params.projectId, user: req.user._id })
        .then(async (project) => {
            if (!project) res.json(resResult(false, 'Project not found'));

            var mongo = await getConnections(project._id.toString());
            var isDroped = await mongo.dropDatabase(); //true false
            res.json(resResult(true, undefined, project));
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
});

router.get('/:projectId/collections', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections(req.params.projectId.toString());
        var collections = await mongo.listCollections().toArray();
        var results = [];
        for (const index in collections) {
            if (collections[index].type === 'collection') results.push(collections[index].name);
        }
        res.json(resResult(true, undefined, results));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
})

module.exports = router;