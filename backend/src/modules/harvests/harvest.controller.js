const harvestService = require('./harvest.service');

exports.getAllHarvests = async (req, res, next) => {
    try {
        const harvests = await harvestService.getAllHarvests(req.user.id, req.user.role, {
            cropId: req.query.cropId,
            farmId: req.query.farmId,
            limit: req.query.limit
        });
        res.status(200).json({
            success: true,
            data: harvests
        });
    } catch (error) {
        next(error);
    }
};

exports.getHarvestStats = async (req, res, next) => {
    try {
        const stats = await harvestService.getHarvestStats(req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

exports.createHarvest = async (req, res, next) => {
    try {
        const harvest = await harvestService.createHarvest(req.body, req.user.id, req.user.role);
        res.status(201).json({
            success: true,
            message: 'Hasil panen berhasil dicatat ke sistem',
            data: harvest
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteHarvest = async (req, res, next) => {
    try {
        const result = await harvestService.deleteHarvest(req.params.id, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { id: result.id }
        });
    } catch (error) {
        next(error);
    }
};

