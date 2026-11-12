const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const emailService = require('../services/email.service');

async function test() {
    console.log('🧪 Menguji EmailService Platform Padi Desa...');
    console.log(`Config EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`Config EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Terisi (Panjang: ' + process.env.EMAIL_PASS.length + ')' : '(Kosong/Simulasi)'}`);

    const dummyFarm = {
        name: 'Sawah Subur Blok C1',
        luas: 2.75,
        desa: 'Desa Sukamakmur',
        location: 'Jl. Raya Pertanian No. 8',
        notes: 'Lahan sawah irigasi teknis siap tanam padi varietas Inpari 32',
        createdAt: new Date(),
        user: {
            name: 'Pak Budi Santoso',
            email: 'budi.santoso@example.com'
        }
    };

    const dummyCreator = {
        name: 'Admin Platform',
        role: 'ADMIN',
        email: 'admin@example.com'
    };

    const result = await emailService.sendNewFarmNotification(dummyFarm, dummyCreator);
    console.log('Hasil test notification:', JSON.stringify(result, null, 2));
    process.exit(0);
}

test().catch(err => {
    console.error('Test gagal:', err);
    process.exit(1);
});
