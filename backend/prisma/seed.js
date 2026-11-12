const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    await prisma.farm.deleteMany({});
    await prisma.user.deleteMany({});

    const users = [
        {
            id: 'admin-001',
            email: 'admin@example.com',
            password: 'Demo@123456',
            name: 'Mukhyi Shabil',
            role: 'ADMIN',
            desa: 'Pusat'
        },
        {
            id: 'kades-001',
            email: 'kepala@example.com',
            password: 'Demo@123456',
            name: 'Kepala Desa Sukamakmur',
            role: 'KEPALA_DESA',
            desa: 'Desa Sukamakmur'
        },
        {
            id: 'petani-001',
            email: 'petani@example.com',
            password: 'Demo@123456',
            name: 'Petani Desa Sukamakmur',
            role: 'PETANI',
            desa: 'Desa Sukamakmur'
        }
    ];

    for (const u of users) {
        await prisma.user.create({ data: u });
        console.log(`✅ User dibuat: ${u.email}`);
    }

    console.log('🎉 Seeding selesai!');
}

main()
    .catch((e) => { console.error('❌', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });