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
            let stats = [];
            for (const index in projects) {
                let mongo = await getConnections();
                let db = await mongo.db((projects[index]._id).toString());
                let stat = await db.stats();
                stats.push(stat);
                await mongo.close();
            }
            res.json(resResult(true, undefined, stats));
        })
        .catch(err => { res.status(500).json(resResult(false, undefined, err)) });
})



router.delete('/:projectId', verifyToken, (req, res) => {
    Project.findOneAndRemove({ _id: req.params.projectId, user: req.user._id })
        .then(async (project) => {
            if (!project) res.json(resResult(false, 'Project not found'));

            try {
                var mongo = await getConnections();
                let db = await mongo.db(project._id.toString());
                let isDroped = await db.dropDatabase(); //true false
                res.json(resResult(true, undefined, project));
            }
            catch (err) {
                throw err;
            }
            finally {
                mongo.close();
            }
        })
        .catch(err => res.status(500).json(resResult(false, undefined, err)));
});

router.get('/:projectId/collections', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections();
        let db = await mongo.db(req.params.projectId.toString());
        let collections = await db.listCollections().toArray();
        let results = [];
        for (const index in collections) {
            if (collections[index].type === 'collection') results.push(collections[index].name);
        }
        res.json(resResult(true, undefined, results));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

router.post('/:projectId/collections', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections();
        let db = await mongo.db(req.params.projectId.toString());
        await db.createCollection(req.body.collectionName);
        res.json(resResult(true));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

router.delete('/:projectId/collections', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections();
        let db = await mongo.db(req.params.projectId.toString());
        let collection = await db.dropCollection(req.query.collectionName);
        res.json(resResult(true, undefined, collection));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

module.exports = router;