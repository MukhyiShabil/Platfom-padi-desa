const router = require('express').Router();
const activityController = require('./activity.controller');
const verifyToken = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', activityController.getAllActivities);
router.get('/stats', activityController.getActivityStats);
router.post('/', activityController.createActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;

