const prisma = require('../../config/database');

class CropService {
    // Get all crops (with optional farmId filter)
    async getAllCrops(userId, userRole, filter = {}) {
        try {
            const where = {};

            if (filter.farmId) {
                where.farmId = filter.farmId;
            }

            // Role filtering
            if (userRole === 'PETANI') {
                where.farm = { userId };
            } else if (userRole === 'KEPALA_DESA') {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { desa: true }
                });
                if (user?.desa) {
                    where.farm = { desa: user.desa };
                }
            }

            const crops = await prisma.crop.findMany({
                where,
                include: {
                    farm: {
                        select: {
                            id: true,
                            name: true,
                            desa: true,
                            luas: true,
                            userId: true,
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    harvests: {
                        orderBy: { date: 'desc' }
                    },
                    activities: {
                        orderBy: { date: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return crops;
        } catch (error) {
            throw new Error(`Gagal mengambil data tanaman: ${error.message}`);
        }
    }

    // Get crop by ID
    async getCropById(id, userId, userRole) {
        try {
            const crop = await prisma.crop.findUnique({
                where: { id },
                include: {
                    farm: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, desa: true }
                            }
                        }
                    },
                    harvests: {
                        orderBy: { date: 'desc' }
                    },
                    activities: {
                        orderBy: { date: 'desc' }
                    }
                }
            });

            if (!crop) {
                throw new Error('Data komoditas tanaman tidak ditemukan');
            }

            if (userRole === 'PETANI' && crop.farm.userId !== userId) {
                throw new Error('Anda tidak memiliki akses ke tanaman lahan ini');
            }

            return crop;
        } catch (error) {
            throw new Error(`Gagal mengambil detail tanaman: ${error.message}`);
        }
    }

    // Create crop
    async createCrop(data, userId, userRole) {
        try {
            const { farmId, variety, status } = data;

            if (!farmId || !variety) {
                throw new Error('ID Lahan (farmId) dan Varietas (variety) wajib diisi');
            }

            // Verify farm exists & access
            const farm = await prisma.farm.findUnique({
                where: { id: farmId }
            });

            if (!farm) {
                throw new Error('Lahan tidak ditemukan');
            }

            if (userRole === 'PETANI' && farm.userId !== userId) {
                throw new Error('Anda hanya dapat menambahkan tanaman pada lahan milik sendiri');
            }

            const newCrop = await prisma.crop.create({
                data: {
                    farmId,
                    variety: variety.trim(),
                    status: status || 'ACTIVE'
                },
                include: {
                    farm: {
                        select: { id: true, name: true, desa: true }
                    }
                }
            });

            return newCrop;
        } catch (error) {
            throw new Error(`Gagal menambahkan tanaman: ${error.message}`);
        }
    }

    // Update crop
    async updateCrop(id, data, userId, userRole) {
        try {
            const crop = await prisma.crop.findUnique({
                where: { id },
                include: { farm: true }
            });

            if (!crop) {
                throw new Error('Data tanaman tidak ditemukan');
            }

            if (userRole === 'PETANI' && crop.farm.userId !== userId) {
                throw new Error('Anda tidak berhak mengubah tanaman ini');
            }

            const updateData = {};
            if (data.variety) updateData.variety = data.variety.trim();
            if (data.status) updateData.status = data.status;

            const updatedCrop = await prisma.crop.update({
                where: { id },
                data: updateData,
                include: {
                    farm: true
                }
            });

            return updatedCrop;
        } catch (error) {
            throw new Error(`Gagal memperbarui data tanaman: ${error.message}`);
        }
    }

    // Delete crop
    async deleteCrop(id, userId, userRole) {
        try {
            const crop = await prisma.crop.findUnique({
                where: { id },
                include: { farm: true }
            });

            if (!crop) {
                throw new Error('Data tanaman tidak ditemukan');
            }

            if (userRole === 'PETANI' && crop.farm.userId !== userId) {
                throw new Error('Anda tidak berhak menghapus tanaman ini');
            }

            // Delete associated harvests and activities first
            await prisma.harvest.deleteMany({ where: { cropId: id } });
            await prisma.activity.deleteMany({ where: { cropId: id } });

            await prisma.crop.delete({ where: { id } });

            return { id, message: 'Komoditas tanaman dan riwayat terkait berhasil dihapus' };
        } catch (error) {
            throw new Error(`Gagal menghapus tanaman: ${error.message}`);
        }
    }
}

module.exports = new CropService();
