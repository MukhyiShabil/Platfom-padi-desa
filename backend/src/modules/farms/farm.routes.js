const router = require('express').Router();

const farmController = require('./farm.controller');
const verifyToken = require('../../middlewares/auth');
const authorize = require('../../middlewares/role');

// Semua route farm membutuhkan login
router.use(verifyToken);

// GET semua data farm
router.get('/', farmController.getAllFarms);

// GET farm berdasarkan ID
router.get('/:id', farmController.getFarmById);

// POST tambah farm (Hanya ADMIN dan KEPALA_DESA)
router.post(
    '/',
    authorize('ADMIN', 'KEPALA_DESA'),
    farmController.createFarm
);

// POST test notifikasi email (Hanya ADMIN dan KEPALA_DESA)
router.post(
    '/test-notification',
    authorize('ADMIN', 'KEPALA_DESA'),
    farmController.testEmailNotification
);

// PUT update farm (Hanya ADMIN dan KEPALA_DESA)
router.put(
    '/:id',
    authorize('ADMIN', 'KEPALA_DESA'),
    farmController.updateFarm
);

// DELETE farm (Hanya ADMIN dan KEPALA_DESA)
router.delete(
    '/:id',
    authorize('ADMIN', 'KEPALA_DESA'),
    farmController.deleteFarm
);

module.exports = router;