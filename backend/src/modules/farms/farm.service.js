const prisma = require('../../config/database');
const emailService = require('../../services/email.service');

class FarmService {
    // Get all farms
    async getAllFarms(userId, userRole) {
        try {
            const where = {};

            // Filter berdasarkan role
            if (userRole === 'PETANI') {
                where.userId = userId;
            } else if (userRole === 'KEPALA_DESA') {
                // Ambil semua petani di desa yang sama
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { desa: true }
                });

                if (user?.desa) {
                    const petaniIds = await prisma.user.findMany({
                        where: { desa: user.desa, role: 'PETANI' },
                        select: { id: true }
                    });
                    const idList = petaniIds.map(p => p.id);
                    where.OR = [
                        { userId: { in: idList } },
                        { desa: user.desa },
                        { userId: userId }
                    ];
                }
            }

            const farms = await prisma.farm.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            desa: true
                        }
                    },
                    crops: {
                        where: { status: 'ACTIVE' },
                        select: { id: true, variety: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return farms;
        } catch (error) {
            throw new Error(`Gagal mengambil data lahan: ${error.message}`);
        }
    }

    // Get farm by ID
    async getFarmById(id, userId, userRole) {
        try {
            const farm = await prisma.farm.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            desa: true
                        }
                    },
                    crops: {
                        include: {
                            harvests: true,
                            activities: true
                        }
                    }
                }
            });

            if (!farm) {
                throw new Error('Lahan tidak ditemukan');
            }

            // Cek akses
            if (userRole === 'PETANI' && farm.userId !== userId) {
                throw new Error('Anda tidak memiliki akses ke lahan ini');
            }

            return farm;
        } catch (error) {
            throw new Error(`Gagal mengambil detail lahan: ${error.message}`);
        }
    }

    // Create farm
    async createFarm(data, userId) {
        try {
            const { name, luas, location, desa, notes } = data;

            if (!name || !luas) {
                throw new Error('Nama dan luas lahan wajib diisi');
            }

            if (luas <= 0) {
                throw new Error('Luas lahan harus lebih dari 0');
            }

            let farmUserId = data.userId;

            // Jika ada permintaan menambah nama pemilik baru / nama lain
            if (data.newOwnerName && data.newOwnerName.trim()) {
                const ownerName = data.newOwnerName.trim();

                // Cari creator untuk info desa cadangan
                const creator = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { desa: true }
                });

                const ownerDesa = (data.newOwnerDesa && data.newOwnerDesa.trim())
                    ? data.newOwnerDesa.trim()
                    : (desa && desa.trim() ? desa.trim() : (creator?.desa || null));

                const cleanSlug = ownerName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '') || 'petani';
                const randomCode = Math.floor(1000 + Math.random() * 9000);
                let ownerEmail = (data.newOwnerEmail && data.newOwnerEmail.trim())
                    ? data.newOwnerEmail.trim().toLowerCase()
                    : `${cleanSlug}.${randomCode}@desa.local`;

                // Pastikan email unik
                let existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
                let counter = 1;
                while (existingUser) {
                    ownerEmail = `${cleanSlug}.${randomCode}.${counter}@desa.local`;
                    existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
                    counter++;
                }

                // Buat akun Petani baru
                const newPetani = await prisma.user.create({
                    data: {
                        name: ownerName,
                        email: ownerEmail,
                        password: data.newOwnerPassword || 'petani123',
                        role: 'PETANI',
                        desa: ownerDesa,
                        isActive: true
                    }
                });

                farmUserId = newPetani.id;
            } else if (!farmUserId || farmUserId === '__NEW_OWNER__') {
                farmUserId = userId;
            }

            const farm = await prisma.farm.create({
                data: {
                    name,
                    luas: parseFloat(luas),
                    location: location || '',
                    desa: desa || '',
                    notes: notes || '',
                    userId: farmUserId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            desa: true
                        }
                    }
                }
            });

            // Kirim notifikasi email ke semua pengguna dan email tujuan khusus jika dimasukkan
            let emailNotification = null;
            try {
                const customNotifEmail = data.notificationEmail || data.customNotificationEmail || null;
                emailNotification = await emailService.sendNewFarmNotification(farm, userId, customNotifEmail);
            } catch (notifErr) {
                console.error('⚠️ [Notification Error] Gagal memproses notifikasi email:', notifErr.message);
                emailNotification = { success: false, error: notifErr.message };
            }

            return {
                ...farm,
                emailNotification
            };
        } catch (error) {
            throw new Error(`Gagal menambahkan lahan: ${error.message}`);
        }
    }

    // Update farm
    async updateFarm(id, data, userId, userRole) {
        try {
            // Cek apakah lahan ada
            const existingFarm = await prisma.farm.findUnique({
                where: { id }
            });

            if (!existingFarm) {
                throw new Error('Lahan tidak ditemukan');
            }

            // Cek akses: Hanya ADMIN dan KEPALA_DESA
            if (userRole === 'PETANI') {
                throw new Error('Petani tidak memiliki akses untuk mengubah data lahan. Hanya Admin dan Kepala Desa yang berwenang.');
            }

            const { name, luas, location, desa, notes, userId: newUserId } = data;

            const farm = await prisma.farm.update({
                where: { id },
                data: {
                    name: name || existingFarm.name,
                    luas: luas ? parseFloat(luas) : existingFarm.luas,
                    location: location !== undefined ? location : existingFarm.location,
                    desa: desa !== undefined ? desa : existingFarm.desa,
                    notes: notes !== undefined ? notes : existingFarm.notes,
                    userId: newUserId || existingFarm.userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return farm;
        } catch (error) {
            throw new Error(`Gagal mengupdate lahan: ${error.message}`);
        }
    }

    // Delete farm
    async deleteFarm(id, userId, userRole) {
        try {
            const existingFarm = await prisma.farm.findUnique({
                where: { id },
                include: {
                    crops: {
                        where: { status: 'ACTIVE' }
                    }
                }
            });

            if (!existingFarm) {
                throw new Error('Lahan tidak ditemukan');
            }

            // Cek akses: Hanya ADMIN dan KEPALA_DESA
            if (userRole === 'PETANI') {
                throw new Error('Petani tidak memiliki akses untuk menghapus data lahan. Hanya Admin dan Kepala Desa yang berwenang.');
            }

            // Cek apakah ada tanaman aktif
            if (existingFarm.crops.length > 0) {
                throw new Error('Tidak dapat menghapus lahan yang memiliki tanaman aktif');
            }

            await prisma.farm.delete({
                where: { id }
            });

            return { success: true, message: 'Lahan berhasil dihapus' };
        } catch (error) {
            throw new Error(`Gagal menghapus lahan: ${error.message}`);
        }
    }
}

module.exports = new FarmService();