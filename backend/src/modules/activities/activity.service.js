const prisma = require('../../config/database');

class ActivityService {
    // Get all activities
    async getAllActivities(userId, userRole, filter = {}) {
        try {
            const where = {};

            if (filter.type) {
                where.type = filter.type;
            }

            if (filter.cropId) {
                where.cropId = filter.cropId;
            } else if (filter.farmId) {
                where.crop = { farmId: filter.farmId };
            }

            // Role filtering
            if (userRole === 'PETANI') {
                where.crop = {
                    ...where.crop,
                    farm: { userId }
                };
            } else if (userRole === 'KEPALA_DESA') {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { desa: true }
                });
                if (user?.desa) {
                    where.crop = {
                        ...where.crop,
                        farm: { desa: user.desa }
                    };
                }
            }

            const activities = await prisma.activity.findMany({
                where,
                include: {
                    crop: {
                        include: {
                            farm: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true, desa: true }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { date: 'desc' },
                take: filter.limit ? parseInt(filter.limit, 10) : undefined
            });

            return activities;
        } catch (error) {
            throw new Error(`Gagal mengambil data aktivitas: ${error.message}`);
        }
    }

    // Get activity stats
    async getActivityStats(userId, userRole) {
        try {
            const all = await this.getAllActivities(userId, userRole);
            const total = all.length;

            // Group by type
            const byType = {};
            for (const act of all) {
                const t = act.type || 'LAINNYA';
                byType[t] = (byType[t] || 0) + 1;
            }

            const recentActivities = all.slice(0, 5);

            return {
                totalActivities: total,
                byType,
                recentActivities
            };
        } catch (error) {
            throw new Error(`Gagal menghitung statistik aktivitas: ${error.message}`);
        }
    }

    // Create activity record
    async createActivity(data, userId, userRole) {
        try {
            let { cropId, farmId, variety, type, description, date } = data;

            if (!type || !type.trim()) {
                throw new Error('Jenis aktivitas (type) wajib diisi');
            }

            const activityType = type.trim().toUpperCase();

            // Find or create crop if cropId is not provided
            if (!cropId) {
                if (!farmId) {
                    throw new Error('Pilih Lahan Pertanian (farmId) atau Komoditas Tanaman (cropId)');
                }

                const farm = await prisma.farm.findUnique({
                    where: { id: farmId }
                });

                if (!farm) {
                    throw new Error('Lahan tidak ditemukan');
                }

                if (userRole === 'PETANI' && farm.userId !== userId) {
                    throw new Error('Anda tidak memiliki akses ke lahan ini');
                }

                const varietyName = (variety && variety.trim()) ? variety.trim() : 'Padi Ciherang';

                let existingCrop = await prisma.crop.findFirst({
                    where: {
                        farmId,
                        variety: varietyName,
                        status: 'ACTIVE'
                    }
                });

                if (!existingCrop) {
                    existingCrop = await prisma.crop.create({
                        data: {
                            farmId,
                            variety: varietyName,
                            status: 'ACTIVE'
                        }
                    });
                }

                cropId = existingCrop.id;
            } else {
                const crop = await prisma.crop.findUnique({
                    where: { id: cropId },
                    include: { farm: true }
                });

                if (!crop) {
                    throw new Error('Tanaman tidak ditemukan');
                }

                if (userRole === 'PETANI' && crop.farm.userId !== userId) {
                    throw new Error('Anda tidak memiliki akses ke tanaman ini');
                }
            }

            const actDate = date ? new Date(date) : new Date();

            const newActivity = await prisma.activity.create({
                data: {
                    cropId,
                    type: activityType,
                    description: description ? description.trim() : null,
                    date: actDate
                },
                include: {
                    crop: {
                        include: {
                            farm: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return newActivity;
        } catch (error) {
            throw new Error(`Gagal mencatat aktivitas pertanian: ${error.message}`);
        }
    }

    // Delete activity
    async deleteActivity(id, userId, userRole) {
        try {
            const activity = await prisma.activity.findUnique({
                where: { id },
                include: {
                    crop: {
                        include: { farm: true }
                    }
                }
            });

            if (!activity) {
                throw new Error('Aktivitas tidak ditemukan');
            }

            if (userRole === 'PETANI' && activity.crop.farm.userId !== userId) {
                throw new Error('Anda tidak berhak menghapus aktivitas ini');
            }

            await prisma.activity.delete({ where: { id } });

            return { id, message: 'Aktivitas berhasil dihapus' };
        } catch (error) {
            throw new Error(`Gagal menghapus aktivitas: ${error.message}`);
        }
    }
}

module.exports = new ActivityService();
