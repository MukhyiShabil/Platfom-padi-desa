const activityService = require('./activity.service');

exports.getAllActivities = async (req, res, next) => {
    try {
        const activities = await activityService.getAllActivities(req.user.id, req.user.role, {
            type: req.query.type,
            cropId: req.query.cropId,
            farmId: req.query.farmId,
            limit: req.query.limit
        });
        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};

exports.getActivityStats = async (req, res, next) => {
    try {
        const stats = await activityService.getActivityStats(req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

exports.createActivity = async (req, res, next) => {
    try {
        const activity = await activityService.createActivity(req.body, req.user.id, req.user.role);
        res.status(201).json({
            success: true,
            message: 'Aktivitas pertanian berhasil dicatat',
            data: activity
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteActivity = async (req, res, next) => {
    try {
        const result = await activityService.deleteActivity(req.params.id, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { id: result.id }
        });
    } catch (error) {
        next(error);
    }
};
