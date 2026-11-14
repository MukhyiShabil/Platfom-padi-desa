const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-New-Token'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./modules/auth/auth.routes');
const farmRoutes = require('./modules/farms/farm.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const userRoutes = require('./modules/users/user.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const cropRoutes = require('./modules/crops/crop.routes');
const harvestRoutes = require('./modules/harvests/harvest.routes');
const activityRoutes = require('./modules/activities/activity.routes');

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Platform Padi Desa API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ============================================
// START SERVER
// ============================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('🌾 PLATFORM PADI DESA - BACKEND');
    console.log('========================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
    console.log('📋 Available routes:');
    console.log(`  - Health:     http://localhost:${PORT}/api/health`);
    console.log(`  - Auth:       http://localhost:${PORT}/api/auth`);
    console.log(`  - Dashboard:  http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`  - Farms:      http://localhost:${PORT}/api/farms`);
    console.log(`  - Crops:      http://localhost:${PORT}/api/crops`);
    console.log(`  - Harvests:   http://localhost:${PORT}/api/harvests`);
    console.log(`  - Activities: http://localhost:${PORT}/api/activities`);
    console.log(`  - Users:      http://localhost:${PORT}/api/users`);
    console.log(`  - AI:         http://localhost:${PORT}/api/ai  ← AI CHAT`);
    console.log('========================================');
  });
}

module.exports = app;