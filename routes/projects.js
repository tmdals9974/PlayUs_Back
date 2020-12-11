const router = require('express').Router();
const Project = require('../models/project');
const mongodb = require("mongodb");
const { getConnections, resResult, verifyToken } = require('../common');
const validateCollection = 'playus_secret_validate_collection';

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
        .then(async project => {

            try {
                var mongo = await getConnections();
                const db = await mongo.db(project._id.toString());
                await db.createCollection(validateCollection);
                res.json(resResult(true, undefined, project.getPublicFields()));
            }
            catch (err) {
                throw err;
            }
            finally {
                mongo.close();
            }
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
            const stats = [];
            for (const index in projects) {
                const mongo = await getConnections();
                const db = await mongo.db((projects[index]._id).toString());
                const stat = await db.stats();
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
                const db = await mongo.db(project._id.toString());
                const isDroped = await db.dropDatabase(); //true false
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
        const db = await mongo.db(req.params.projectId.toString());
        const collections = await db.listCollections().toArray();
        const results = [];
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
        const db = await mongo.db(req.params.projectId.toString());
        await db.createCollection(req.body.collectionName);

        const collection = await db.collection(validateCollection);
        const result = await collection.insertOne({ 
            collectionName: req.body.collectionName,
            collectionRules: [ ...req.body.collectionRules ]
        });

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
    if (!req.query.collectionName) return res.status(400).json(resResult(false, 'collectionName이 필요합니다.'));
    try {
        var mongo = await getConnections();
        const db = await mongo.db(req.params.projectId.toString());
        const collection = await db.dropCollection(req.query.collectionName);
        res.json(resResult(true, undefined, collection));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

router.get('/:projectId/:collectionName/document', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections();
        const db = await mongo.db(req.params.projectId.toString());
        const collection = await db.collection(req.params.collectionName.toString());
        const result = await collection.find({}).toArray();
        res.json(resResult(true, undefined, result));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

router.post('/:projectId/:collectionName/document', verifyToken, async (req, res) => {
    try {
        var mongo = await getConnections();
        const db = await mongo.db(req.params.projectId.toString());
        const collection = await db.collection(req.params.collectionName.toString());
        const result = Array.isArray(req.body) ? await collection.insertMany(req.body) : await collection.insertOne(req.body);
        res.json(resResult(true, undefined, result));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

router.delete('/:projectId/:collectionName/document', verifyToken, async (req, res) => {
    if (!req.query.documentId) return res.status(400).json(resResult(false, 'documentId가 필요합니다.'));
    try {
        var mongo = await getConnections();
        const db = await mongo.db(req.params.projectId.toString());
        const collection = await db.collection(req.params.collectionName.toString());
        const result = await collection.deleteOne({ _id : new mongodb.ObjectID(req.query.documentId) });
        res.json(resResult(true, undefined, result));
    }
    catch (err) {
        res.status(500).json(resResult(false, undefined, err));
    }
    finally {
        mongo.close();
    }
})

module.exports = router;