const farmService = require('./farm.service');

class FarmController {
    // Get all farms
    async getAllFarms(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const farms = await farmService.getAllFarms(userId, userRole);

            res.json({
                success: true,
                data: farms
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get farm by ID
    async getFarmById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const farm = await farmService.getFarmById(id, userId, userRole);

            res.json({
                success: true,
                data: farm
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create farm
    async createFarm(req, res) {
        try {
            const data = req.body;
            const userId = req.user.id;

            const farm = await farmService.createFarm(data, userId);

            res.status(201).json({
                success: true,
                message: 'Lahan berhasil ditambahkan',
                data: farm,
                notification: farm.emailNotification
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Test email notification
    async testEmailNotification(req, res) {
        try {
            const emailService = require('../../services/email.service');
            const sampleFarm = {
                name: req.body.name || 'Lahan Uji Coba Blok Sukamakmur',
                luas: req.body.luas ? parseFloat(req.body.luas) : 1.5,
                desa: req.body.desa || 'Desa Sukamakmur',
                location: req.body.location || 'Kawasan Pertanian Selatan',
                notes: req.body.notes || 'Pengujian pengiriman notifikasi email otomatis',
                createdAt: new Date(),
                user: {
                    name: req.user.name || 'Pengelola Lahan',
                    email: req.user.email || 'pengelola@example.com'
                }
            };

            const notifResult = await emailService.sendNewFarmNotification(sampleFarm, req.user);

            res.json({
                success: true,
                message: 'Uji coba notifikasi email berhasil diproses',
                notification: notifResult
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update farm
    async updateFarm(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            const farm = await farmService.updateFarm(id, data, userId, userRole);

            res.json({
                success: true,
                message: 'Lahan berhasil diperbarui',
                data: farm
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete farm
    async deleteFarm(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const result = await farmService.deleteFarm(id, userId, userRole);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new FarmController();