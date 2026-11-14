const prisma = require('../../config/database');

class HarvestService {
    // Get all harvest records
    async getAllHarvests(userId, userRole, filter = {}) {
        try {
            const where = {};

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

            const harvests = await prisma.harvest.findMany({
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

            return harvests;
        } catch (error) {
            throw new Error(`Gagal mengambil data panen: ${error.message}`);
        }
    }

    // Get harvest statistics
    async getHarvestStats(userId, userRole) {
        try {
            const allHarvests = await this.getAllHarvests(userId, userRole);
            const totalKg = allHarvests.reduce((sum, h) => sum + (Number(h.totalKg) || 0), 0);
            const count = allHarvests.length;
            const recentHarvests = allHarvests.slice(0, 5);

            return {
                totalKg,
                totalTon: parseFloat((totalKg / 1000).toFixed(2)),
                totalRecords: count,
                averagePerHarvest: count > 0 ? parseFloat((totalKg / count).toFixed(1)) : 0,
                recentHarvests
            };
        } catch (error) {
            throw new Error(`Gagal menghitung statistik panen: ${error.message}`);
        }
    }

    // Create harvest record
    async createHarvest(data, userId, userRole) {
        try {
            let { cropId, farmId, variety, totalKg, date } = data;

            const kg = parseFloat(totalKg);
            if (isNaN(kg) || kg <= 0) {
                throw new Error('Jumlah panen (totalKg) harus angka positif');
            }

            // If cropId not provided, find or create from farmId & variety
            if (!cropId) {
                if (!farmId) {
                    throw new Error('Pilih Lahan Pertanian (farmId) atau Tanaman (cropId)');
                }

                // Check farm existence
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

                // Find active crop or create new
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
                // Check crop
                const crop = await prisma.crop.findUnique({
                    where: { id: cropId },
                    include: { farm: true }
                });

                if (!crop) {
                    throw new Error('Komoditas tanaman tidak ditemukan');
                }

                if (userRole === 'PETANI' && crop.farm.userId !== userId) {
                    throw new Error('Anda tidak memiliki akses ke tanaman ini');
                }
            }

            const harvestDate = date ? new Date(date) : new Date();

            const newHarvest = await prisma.harvest.create({
                data: {
                    cropId,
                    totalKg: kg,
                    date: harvestDate
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

            return newHarvest;
        } catch (error) {
            throw new Error(`Gagal mencatat hasil panen: ${error.message}`);
        }
    }

    // Delete harvest
    async deleteHarvest(id, userId, userRole) {
        try {
            const harvest = await prisma.harvest.findUnique({
                where: { id },
                include: {
                    crop: {
                        include: { farm: true }
                    }
                }
            });

            if (!harvest) {
                throw new Error('Data panen tidak ditemukan');
            }

            if (userRole === 'PETANI' && harvest.crop.farm.userId !== userId) {
                throw new Error('Anda tidak berhak menghapus data panen ini');
            }

            await prisma.harvest.delete({ where: { id } });

            return { id, message: 'Data panen berhasil dihapus' };
        } catch (error) {
            throw new Error(`Gagal menghapus data panen: ${error.message}`);
        }
    }
}

module.exports = new HarvestService();

