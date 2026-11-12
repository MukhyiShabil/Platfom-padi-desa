const router = require('express').Router();
const userController = require('./user.controller');
const verifyToken = require('../../middlewares/auth');
const authorize = require('../../middlewares/role');

// Middleware autentikasi untuk semua route pengguna
router.use(verifyToken);

// GET statistik dan siapa aja yang menggunakan sistem
router.get('/stats', userController.getUserStats);

// GET semua pengguna (bisa difilter via query: ?search=&role=&status=&desa=)
router.get('/', userController.getAllUsers);

// GET detail pengguna by ID
router.get('/:id', userController.getUserById);

// POST tambah pengguna baru (Hanya ADMIN)
router.post('/', authorize('ADMIN'), userController.createUser);

// PUT edit pengguna (Hanya ADMIN)
router.put('/:id', authorize('ADMIN'), userController.updateUser);

// PATCH ubah status aktif/nonaktif (Hanya ADMIN)
router.patch('/:id/status', authorize('ADMIN'), userController.toggleStatus);

// DELETE hapus pengguna (Hanya ADMIN)
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

console.log('✅ User routes loaded: /api/users (CRUD, stats, status toggle)');

module.exports = router;
