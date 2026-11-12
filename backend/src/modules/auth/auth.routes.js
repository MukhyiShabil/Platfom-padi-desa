const router = require('express').Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);
router.get('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);

console.log('✅ Auth routes loaded: /login, /register, /refresh, /me');

module.exports = router;