const userService = require('./user.service');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

class UserController {
    // GET /api/users
    async getAllUsers(req, res) {
        try {
            const filters = {
                search: req.query.search,
                role: req.query.role,
                status: req.query.status,
                desa: req.query.desa
            };

            const users = await userService.getAllUsers(filters);

            res.json({
                success: true,
                message: 'Data pengguna berhasil diambil',
                total: users.length,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/users/stats
    async getUserStats(req, res) {
        try {
            const stats = await userService.getUserStats();
            res.json({
                success: true,
                message: 'Statistik pengguna dan peran pemangku kepentingan berhasil diambil',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/users/:id
    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.json({
                success: true,
                message: 'Detail pengguna berhasil diambil',
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/users
    async createUser(req, res) {
        try {
            const newUser = await userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: `Pengguna baru "${newUser.name}" berhasil ditambahkan`,
                data: newUser
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/users/:id
    async updateUser(req, res) {
        try {
            const updatedUser = await userService.updateUser(req.params.id, req.body);
            let newToken = null;
            if (req.user && (req.user.id === updatedUser.id || req.user.email === updatedUser.email)) {
                newToken = jwt.sign(
                    {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        desa: updatedUser.desa
                    },
                    env.JWT_SECRET || 'rahasia123',
                    { expiresIn: env.JWT_EXPIRE || '30d' }
                );
                res.setHeader('X-New-Token', newToken);
                res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
            }

            res.json({
                success: true,
                message: `Data pengguna "${updatedUser.name}" berhasil diperbarui`,
                data: updatedUser,
                newToken
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // PATCH /api/users/:id/status
    async toggleStatus(req, res) {
        try {
            const currentUserId = req.user?.id;
            const result = await userService.toggleStatus(req.params.id, currentUserId);
            res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/users/:id
    async deleteUser(req, res) {
        try {
            const currentUserId = req.user?.id;
            const result = await userService.deleteUser(req.params.id, currentUserId);
            res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new UserController();
