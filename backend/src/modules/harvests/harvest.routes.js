const router = require('express').Router();
const harvestController = require('./harvest.controller');
const verifyToken = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', harvestController.getAllHarvests);
router.get('/stats', harvestController.getHarvestStats);
router.post('/', harvestController.createHarvest);
router.delete('/:id', harvestController.deleteHarvest);

module.exports = router;
