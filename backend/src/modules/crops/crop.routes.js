const router = require('express').Router();
const cropController = require('./crop.controller');
const verifyToken = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', cropController.getAllCrops);
router.get('/:id', cropController.getCropById);
router.post('/', cropController.createCrop);
router.put('/:id', cropController.updateCrop);
router.delete('/:id', cropController.deleteCrop);

module.exports = router;
