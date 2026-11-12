const axios = require('axios');
const prisma = require('../config/database');

const API_BASE = 'http://127.0.0.1:5000/api';

async function runTest() {
    console.log('🚀 Menjalankan pengujian flow penambahan lahan & notifikasi email...');

    // 1. Login sebagai Admin
    console.log('\n1. Melakukan login sebagai Admin...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'Demo@123456'
    });

    const token = loginRes.data.data?.accessToken || loginRes.data.accessToken;
    console.log('✅ Login berhasil! Token didapatkan.');

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Test endpoint test-notification
    console.log('\n2. Menguji endpoint POST /api/farms/test-notification...');
    const testNotifRes = await axios.post(`${API_BASE}/farms/test-notification`, {
        name: 'Lahan Riset Sukamakmur 1',
        luas: 3.5,
        desa: 'Desa Sukamakmur',
        location: 'Blok Barat Sawah Contoh',
        notes: 'Lahan percontohan padi varietas Ciherang'
    }, { headers });

    console.log('✅ Status test-notification:', testNotifRes.status);
    console.log('   Hasil Notifikasi:', JSON.stringify(testNotifRes.data.notification, null, 2));

    // 3. Tambah Lahan Baru (POST /api/farms)
    console.log('\n3. Menambahkan Lahan Baru (POST /api/farms)...');
    const newFarmData = {
        name: 'Sawah Irigasi Mandiri Blok Melati',
        luas: 2.2,
        desa: 'Desa Sukamakmur',
        location: 'Jalan Petani Makmur No. 15',
        notes: 'Lahan siap olah untuk masa tanam musim hujan'
    };

    const createFarmRes = await axios.post(`${API_BASE}/farms`, newFarmData, { headers });
    console.log('✅ Status createFarm:', createFarmRes.status);
    console.log('   Respon createFarm:', JSON.stringify({
        success: createFarmRes.data.success,
        message: createFarmRes.data.message,
        farmId: createFarmRes.data.data.id,
        farmName: createFarmRes.data.data.name,
        notification: createFarmRes.data.notification
    }, null, 2));

    const createdFarmId = createFarmRes.data.data.id;

    // 4. Bersihkan data pengujian
    if (createdFarmId) {
        console.log(`\n4. Menghapus data farm uji coba (${createdFarmId})...`);
        await prisma.farm.delete({ where: { id: createdFarmId } });
        console.log('✅ Data farm uji coba berhasil dibersihkan.');
    }

    console.log('\n🎉 Seluruh pengujian flow notifikasi berhasil 100%!');
    process.exit(0);
}

runTest().catch(err => {
    console.error('❌ Pengujian gagal:', err.response?.data || err.message);
    process.exit(1);
});
