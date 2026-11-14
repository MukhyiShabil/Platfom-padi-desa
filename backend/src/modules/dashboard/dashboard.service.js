const prisma = require('../../config/database');

class DashboardService {
    async getStats(userId, userRole) {
        try {
            const userWhere = {};
            const farmWhere = {};
            const harvestWhere = {};
            const activityWhere = {};

            if (userRole === 'PETANI') {
                farmWhere.userId = userId;
                harvestWhere.crop = { farm: { userId } };
                activityWhere.crop = { farm: { userId } };
            } else if (userRole === 'KEPALA_DESA') {
                const currentUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { desa: true }
                });
                if (currentUser?.desa) {
                    userWhere.desa = currentUser.desa;
                    farmWhere.desa = currentUser.desa;
                    harvestWhere.crop = { farm: { desa: currentUser.desa } };
                    activityWhere.crop = { farm: { desa: currentUser.desa } };
                }
            }

            // 1. Users
            const totalUsers = await prisma.user.count({ where: userWhere });
            const activeUsers = await prisma.user.count({
                where: { ...userWhere, isActive: true }
            });

            // 2. Farms
            const farms = await prisma.farm.findMany({
                where: farmWhere,
                select: { id: true, luas: true, name: true, desa: true }
            });
            const totalFarms = farms.length;
            const totalLuas = farms.reduce((sum, f) => sum + (Number(f.luas) || 0), 0);

            // 3. Harvests
            const harvests = await prisma.harvest.findMany({
                where: harvestWhere,
                include: {
                    crop: {
                        include: {
                            farm: {
                                select: { id: true, name: true, desa: true }
                            }
                        }
                    }
                },
                orderBy: { date: 'desc' }
            });
            const totalHarvestKg = harvests.reduce((sum, h) => sum + (Number(h.totalKg) || 0), 0);
            const totalHarvestRecords = harvests.length;
            const recentHarvests = harvests.slice(0, 5);

            // 4. Activities
            const activities = await prisma.activity.findMany({
                where: activityWhere,
                include: {
                    crop: {
                        include: {
                            farm: {
                                select: { id: true, name: true, desa: true }
                            }
                        }
                    }
                },
                orderBy: { date: 'desc' }
            });
            const totalActivities = activities.length;
            const recentActivities = activities.slice(0, 5);

            return {
                summary: {
                    totalUsers,
                    activeUsers,
                    totalFarms,
                    totalLuas: parseFloat(totalLuas.toFixed(2)),
                    totalHarvestKg: Math.round(totalHarvestKg),
                    totalHarvestRecords,
                    totalActivities
                },
                recentHarvests,
                recentActivities
            };
        } catch (error) {
            throw new Error(`Gagal memuat ringkasan dashboard: ${error.message}`);
        }
    }
}

module.exports = new DashboardService();
