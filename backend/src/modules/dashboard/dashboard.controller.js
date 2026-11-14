const dashboardService = require('./dashboard.service');

exports.getStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.getStats(req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};
