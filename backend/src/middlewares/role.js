const { AppError } = require('./error');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Please login first', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: ${req.user.role} does not have access. Required: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;