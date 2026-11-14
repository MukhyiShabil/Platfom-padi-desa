const router = require('express').Router();
const dashboardController = require('./dashboard.controller');
const verifyToken = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/stats', dashboardController.getStats);

module.exports = router;
