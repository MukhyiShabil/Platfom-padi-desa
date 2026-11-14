const prisma = require('../config/database');

async function check() {
    const users = await prisma.user.count();
    const farms = await prisma.farm.findMany({
        include: {
            crops: {
                include: {
                    harvests: true,
                    activities: true
                }
            }
        }
    });
    const crops = await prisma.crop.count();
    const harvests = await prisma.harvest.count();
    const activities = await prisma.activity.count();

    console.log({
        users,
        farmsCount: farms.length,
        farms: farms.map(f => ({
            id: f.id,
            name: f.name,
            luas: f.luas,
            crops: f.crops
        })),
        crops,
        harvests,
        activities
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());

