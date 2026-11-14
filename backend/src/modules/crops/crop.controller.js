const cropService = require('./crop.service');

exports.getAllCrops = async (req, res, next) => {
    try {
        const crops = await cropService.getAllCrops(req.user.id, req.user.role, {
            farmId: req.query.farmId
        });
        res.status(200).json({
            success: true,
            data: crops
        });
    } catch (error) {
        next(error);
    }
};

exports.getCropById = async (req, res, next) => {
    try {
        const crop = await cropService.getCropById(req.params.id, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

exports.createCrop = async (req, res, next) => {
    try {
        const crop = await cropService.createCrop(req.body, req.user.id, req.user.role);
        res.status(201).json({
            success: true,
            message: 'Komoditas tanaman berhasil ditambahkan',
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCrop = async (req, res, next) => {
    try {
        const crop = await cropService.updateCrop(req.params.id, req.body, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: 'Data tanaman berhasil diperbarui',
            data: crop
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteCrop = async (req, res, next) => {
    try {
        const result = await cropService.deleteCrop(req.params.id, req.user.id, req.user.role);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { id: result.id }
        });
    } catch (error) {
        next(error);
    }
};
