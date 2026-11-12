const jwt = require('jsonwebtoken');
const { AppError } = require('./error');
const env = require('../config/env');
const prisma = require('../config/database');

const verifyToken = async (req, res, next) => {
  let token = null;

  // Ambil token dari Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Ambil token dari cookie
  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }

  // Kalau token tidak ada
  if (!token) {
    return next(
      new AppError('No token provided. Please login.', 401)
    );
  }

  try {
    let decoded;
    let isExpired = false;

    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        isExpired = true;
        try {
          decoded = jwt.verify(token, env.JWT_SECRET, { ignoreExpiration: true });
        } catch (innerError) {
          return next(new AppError('Token expired. Please login again.', 401));
        }
      } else if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please login again.', 401));
      } else {
        return next(new AppError('Authentication failed.', 401));
      }
    }

    // Selalu sinkronkan data pengguna terkini langsung dari Database
    // agar setiap perubahan nama pengguna (di manajemen pengguna) langsung aktif untuk AI dan seluruh fitur
    let activeUser = decoded;
    if (decoded && (decoded.id || decoded.email)) {
      try {
        let dbUser = null;
        if (decoded.id) {
          dbUser = await prisma.user.findUnique({
            where: { id: decoded.id }
          });
        }
        if (!dbUser && decoded.email) {
          dbUser = await prisma.user.findUnique({
            where: { email: decoded.email }
          });
        }

        if (dbUser) {
          if (!dbUser.isActive) {
            return next(new AppError('Akun Anda telah dinonaktifkan oleh Administrator.', 403));
          }

          activeUser = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            desa: dbUser.desa,
            isActive: dbUser.isActive
          };

          // Jika nama berubah atau token telah expired, terbitkan token baru yang segar
          const isDataChanged = dbUser.name !== decoded.name || dbUser.role !== decoded.role || dbUser.desa !== decoded.desa;
          if (isExpired || isDataChanged) {
            const newToken = jwt.sign(
              activeUser,
              env.JWT_SECRET,
              { expiresIn: env.JWT_EXPIRE || '30d' }
            );
            res.setHeader('X-New-Token', newToken);
            res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
            req.newToken = newToken;
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Gagal sinkronisasi data user di verifyToken:', dbErr.message);
      }
    }

    req.user = activeUser;
    return next();
  } catch (error) {
    return next(new AppError('Authentication failed.', 401));
  }
};

// Export sebagai function
module.exports = verifyToken;

// Juga export sebagai object agar kedua cara require bisa bekerja
module.exports.verifyToken = verifyToken;