const router = require('express').Router();
const multer = require('multer');
const aiController = require('./ai.controller');
const { verifyToken } = require('../../middlewares/auth');

// Konfigurasi upload file
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Maks 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan'));
        }
    }
});

// Daftar model dapat diakses publik atau terautentikasi
router.get('/models', aiController.getAvailableModels);

// Semua route chat & analisis perlu authentication
router.use(verifyToken);

// Routes
router.post('/chat', aiController.chat);
router.post('/analyze', upload.single('image'), aiController.analyzeImage);
router.get('/history', aiController.getHistory);

console.log('✅ AI routes loaded: /models, /chat, /analyze, /history');

module.exports = router;
