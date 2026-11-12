const prisma = require('../../config/database');

class UserService {
    // ==========================================
    // 1. GET ALL USERS (DENGAN FILTER & SEARCH)
    // ==========================================
    async getAllUsers(filters = {}) {
        try {
            const { search, role, status, desa } = filters;
            const where = {};

            // Filter Role
            if (role && role !== 'ALL') {
                where.role = role.toUpperCase();
            }

            // Filter Status Aktif
            if (status !== undefined && status !== '' && status !== 'ALL') {
                where.isActive = status === 'true' || status === true || status === '1';
            }

            // Filter Desa
            if (desa && desa !== 'ALL') {
                where.desa = desa;
            }

            // Search (Nama / Email / Desa)
            if (search && search.trim() !== '') {
                const keyword = search.trim();
                where.OR = [
                    { name: { contains: keyword } },
                    { email: { contains: keyword } },
                    { desa: { contains: keyword } }
                ];
            }

            const users = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    desa: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    farms: {
                        select: {
                            id: true,
                            name: true,
                            luas: true,
                            crops: {
                                select: { id: true, variety: true, status: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Format data dengan metrik ringkas lahan per pengguna
            const formattedUsers = users.map(user => {
                const totalFarms = user.farms ? user.farms.length : 0;
                const totalLuas = user.farms
                    ? user.farms.reduce((acc, f) => acc + (Number(f.luas) || 0), 0)
                    : 0;
                const totalCrops = user.farms
                    ? user.farms.reduce((acc, f) => acc + (f.crops?.length || 0), 0)
                    : 0;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    desa: user.desa || 'Belum diatur',
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    farmCount: totalFarms,
                    totalLuasHa: Number(totalLuas.toFixed(2)),
                    cropCount: totalCrops,
                    farms: user.farms
                };
            });

            return formattedUsers;
        } catch (error) {
            throw new Error(`Gagal mengambil data pengguna: ${error.message}`);
        }
    }

    // ==========================================
    // 2. STATISTIK PENGGUNA & SIAPA AJA YANG MENGGUNAKAN
    // ==========================================
    async getUserStats() {
        try {
            const allUsers = await prisma.user.findMany({
                include: {
                    farms: {
                        select: { id: true, luas: true }
                    }
                }
            });

            const totalUsers = allUsers.length;
            const activeUsers = allUsers.filter(u => u.isActive).length;
            const inactiveUsers = totalUsers - activeUsers;

            const totalAdmin = allUsers.filter(u => u.role === 'ADMIN').length;
            const totalKades = allUsers.filter(u => u.role === 'KEPALA_DESA').length;
            const totalPetani = allUsers.filter(u => u.role === 'PETANI').length;

            // Kelompokkan per desa
            const desaMap = {};
            allUsers.forEach(u => {
                const desaName = u.desa || 'Pusat / Lainnya';
                desaMap[desaName] = (desaMap[desaName] || 0) + 1;
            });

            const desaDistribution = Object.keys(desaMap).map(key => ({
                desa: key,
                count: desaMap[key]
            }));

            // Deskripsi aktor pemangku kepentingan (Siapa saja yang menggunakan)
            const stakeholders = [
                {
                    role: 'PETANI',
                    title: 'Petani Sawah',
                    icon: '🌾',
                    badgeColor: '#22c55e',
                    count: totalPetani,
                    description: 'Pengguna utama yang mencatat luas lahan, memilih varietas benih padi, jadwal irigasi/pupuk, laporan panen, serta menggunakan AI pendeteksi penyakit tanaman.',
                    capabilities: [
                        'Mendaftarkan dan mengelola lahan pertanian pribadi',
                        'Mencatat aktivitas pemupukan dan penanaman padi',
                        'Mencatat hasil panen (Kilogram)',
                        'Konsultasi interaktif foto tanaman dengan AI Assistant'
                    ]
                },
                {
                    role: 'KEPALA_DESA',
                    title: 'Kepala Desa & Aparatur',
                    icon: '🏛️',
                    badgeColor: '#3b82f6',
                    count: totalKades,
                    description: 'Pejabat desa yang memonitor produktivitas pangan seluruh lahan di desanya, melihat agregasi hasil panen, dan evaluasi ketahanan pangan desa.',
                    capabilities: [
                        'Memantau seluruh lahan petani dalam satu desa binaan',
                        'Melihat total estimasi luas panen dan proyeksi hasil tonase padi',
                        'Mengawasi distribusi laporan pertanian desa'
                    ]
                },
                {
                    role: 'ADMIN',
                    title: 'Administrator Platform',
                    icon: '👑',
                    badgeColor: '#eab308',
                    count: totalAdmin,
                    description: 'Pengelola teknis platform dengan otoritas penuh mengatur akun pengguna, verifikasi data desa, pemeliharaan sistem, dan keamanan aplikasi.',
                    capabilities: [
                        'Menambah, mengedit, dan menonaktifkan pengguna sistem',
                        'Mengelola data seluruh desa dan seluruh lahan tanpa batasan',
                        'Monitoring server, token otentikasi, dan sistem AI'
                    ]
                }
            ];

            return {
                summary: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    totalAdmin,
                    totalKades,
                    totalPetani
                },
                desaDistribution,
                stakeholders,
                recentUsers: allUsers.slice(0, 5).map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    desa: u.desa,
                    isActive: u.isActive,
                    createdAt: u.createdAt
                }))
            };
        } catch (error) {
            throw new Error(`Gagal memuat statistik pengguna: ${error.message}`);
        }
    }

    // ==========================================
    // 3. GET USER BY ID
    // ==========================================
    async getUserById(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    farms: {
                        include: {
                            crops: {
                                include: {
                                    harvests: true,
                                    activities: true
                                }
                            }
                        }
                    }
                }
            });

            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Gagal mengambil data pengguna: ${error.message}`);
        }
    }

    // ==========================================
    // 4. CREATE USER (TAMBAH PENGGUNA)
    // ==========================================
    async createUser(data) {
        try {
            const { name, email, password, role, desa, isActive } = data;

            // Validasi Input
            if (!name || !email || !password) {
                throw new Error('Nama, email, dan password wajib diisi');
            }

            // Validasi Format Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Format email tidak valid');
            }

            if (password.length < 6) {
                throw new Error('Password minimal 6 karakter');
            }

            const allowedRoles = ['ADMIN', 'KEPALA_DESA', 'PETANI'];
            const userRole = (role || 'PETANI').toUpperCase();
            if (!allowedRoles.includes(userRole)) {
                throw new Error(`Role harus salah satu dari: ${allowedRoles.join(', ')}`);
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() }
            });

            if (existingUser) {
                throw new Error('Email sudah terdaftar, silakan gunakan email lain');
            }

            // Buat pengguna baru di database
            const newUser = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password: password, // Dapat disimpan sesuai konvensi sistem demo
                    role: userRole,
                    desa: desa ? desa.trim() : null,
                    isActive: isActive !== undefined ? Boolean(isActive) : true
                }
            });

            const { password: _, ...userSafe } = newUser;
            return userSafe;
        } catch (error) {
            throw new Error(`Gagal menambahkan pengguna: ${error.message}`);
        }
    }

    // ==========================================
    // 5. UPDATE USER
    // ==========================================
    async updateUser(id, data) {
        try {
            const { name, email, password, role, desa, isActive } = data;

            // Pastikan user ada
            const existingUser = await prisma.user.findUnique({ where: { id } });
            if (!existingUser) {
                throw new Error('Pengguna tidak ditemukan');
            }

            const updateData = {};

            if (name) updateData.name = name.trim();
            if (desa !== undefined) updateData.desa = desa ? desa.trim() : null;
            if (isActive !== undefined) updateData.isActive = Boolean(isActive);

            if (role) {
                const allowedRoles = ['ADMIN', 'KEPALA_DESA', 'PETANI'];
                const userRole = role.toUpperCase();
                if (!allowedRoles.includes(userRole)) {
                    throw new Error(`Role harus salah satu dari: ${allowedRoles.join(', ')}`);
                }
                updateData.role = userRole;
            }

            // Jika email diubah, pastikan tidak duplikat dengan akun lain
            if (email && email.toLowerCase().trim() !== existingUser.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Format email tidak valid');
                }

                const emailCheck = await prisma.user.findUnique({
                    where: { email: email.toLowerCase().trim() }
                });
                if (emailCheck && emailCheck.id !== id) {
                    throw new Error('Email tersebut sudah digunakan oleh akun lain');
                }
                updateData.email = email.toLowerCase().trim();
            }

            // Jika password baru diisi
            if (password && password.trim() !== '') {
                if (password.length < 6) {
                    throw new Error('Password minimal 6 karakter');
                }
                updateData.password = password;
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData
            });

            const { password: _, ...userSafe } = updatedUser;
            return userSafe;
        } catch (error) {
            throw new Error(`Gagal memperbarui pengguna: ${error.message}`);
        }
    }

    // ==========================================
    // 6. TOGGLE STATUS AKTIF / NONAKTIF
    // ==========================================
    async toggleStatus(id, currentUserId) {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }

            if (user.id === currentUserId && user.isActive) {
                throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login');
            }

            const updated = await prisma.user.update({
                where: { id },
                data: { isActive: !user.isActive }
            });

            return {
                id: updated.id,
                name: updated.name,
                isActive: updated.isActive,
                message: `Status pengguna berhasil diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`
            };
        } catch (error) {
            throw new Error(`Gagal mengubah status: ${error.message}`);
        }
    }

    // ==========================================
    // 7. DELETE USER
    // ==========================================
    async deleteUser(id, currentUserId) {
        try {
            if (id === currentUserId) {
                throw new Error('Anda tidak dapat menghapus akun Anda sendiri');
            }

            const user = await prisma.user.findUnique({
                where: { id },
                include: { farms: true }
            });

            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }

            // Hapus relasi jika ada lahan
            if (user.farms && user.farms.length > 0) {
                // Untuk keamanan, hapus lahan terkait atau reassign
                for (const farm of user.farms) {
                    // Hapus data harvest dan aktivitas bila ada
                    await prisma.harvest.deleteMany({
                        where: { crop: { farmId: farm.id } }
                    });
                    await prisma.activity.deleteMany({
                        where: { crop: { farmId: farm.id } }
                    });
                    await prisma.crop.deleteMany({
                        where: { farmId: farm.id } }
                    );
                }
                await prisma.farm.deleteMany({
                    where: { userId: id }
                });
            }

            await prisma.user.delete({
                where: { id }
            });

            return {
                id,
                message: `Pengguna ${user.name} (${user.email}) berhasil dihapus`
            };
        } catch (error) {
            throw new Error(`Gagal menghapus pengguna: ${error.message}`);
        }
    }
}

module.exports = new UserService();
