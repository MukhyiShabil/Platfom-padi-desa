const prisma = require('../config/database');
const harvestService = require('../modules/harvests/harvest.service');
const activityService = require('../modules/activities/activity.service');
const dashboardService = require('../modules/dashboard/dashboard.service');

async function test() {
    console.log('🧪 Pengujian Service Panen, Aktivitas & Dashboard Stats...');

    // Ambil 1 user admin & 1 farm
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const farm = await prisma.farm.findFirst();

    if (!admin || !farm) {
        console.log('⚠️ Perlu minimal 1 user dan 1 lahan');
        return;
    }

    console.log(`Menggunakan Lahan: "${farm.name}" (ID: ${farm.id})`);

    // 1. Tambah Panen
    console.log('\n1. Test Create Harvest...');
    const harvest = await harvestService.createHarvest({
        farmId: farm.id,
        variety: 'Padi Ciherang Unggul',
        totalKg: 3250,
        date: new Date().toISOString()
    }, admin.id, admin.role);
    console.log('✅ Berhasil catat panen:', {
        id: harvest.id,
        kg: harvest.totalKg,
        variety: harvest.crop.variety,
        farm: harvest.crop.farm.name
    });

    // 2. Tambah Aktivitas
    console.log('\n2. Test Create Activities...');
    const act1 = await activityService.createActivity({
        farmId: farm.id,
        variety: 'Padi Ciherang Unggul',
        type: 'PEMUPUKAN',
        description: 'Pemberian pupuk NPK Phonska dan Urea tahap 2',
        date: new Date().toISOString()
    }, admin.id, admin.role);
    console.log('✅ Berhasil catat aktivitas 1:', {
        id: act1.id,
        type: act1.type,
        desc: act1.description
    });

    const act2 = await activityService.createActivity({
        farmId: farm.id,
        variety: 'Padi Ciherang Unggul',
        type: 'IRIGASI',
        description: 'Penggenangan petak sawah ketinggian 3 cm',
        date: new Date(Date.now() - 86400000).toISOString()
    }, admin.id, admin.role);
    console.log('✅ Berhasil catat aktivitas 2:', {
        id: act2.id,
        type: act2.type,
        desc: act2.description
    });

    const act3 = await activityService.createActivity({
        farmId: farm.id,
        variety: 'Padi Ciherang Unggul',
        type: 'PENGENDALIAN_HAMA',
        description: 'Penyemprotan hayati pencegahan wereng coklat',
        date: new Date(Date.now() - 172800000).toISOString()
    }, admin.id, admin.role);
    console.log('✅ Berhasil catat aktivitas 3:', {
        id: act3.id,
        type: act3.type,
        desc: act3.description
    });

    // 3. Test Dashboard Stats
    console.log('\n3. Test Dashboard Stats Service...');
    const stats = await dashboardService.getStats(admin.id, admin.role);
    console.log('✅ Dashboard Stats:', JSON.stringify(stats.summary, null, 2));

    console.log('\n🎉 Seluruh pengujian backend Panen & Aktivitas BERHASIL!');
}

test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

