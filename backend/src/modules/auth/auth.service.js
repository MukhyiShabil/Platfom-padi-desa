const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../../services/email.service');

const prisma = new PrismaClient();

class AuthService {
    async login(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) throw new Error('Email atau password salah');
        if (user.password !== password) throw new Error('Email atau password salah');

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                desa: user.desa
            },
            process.env.JWT_SECRET || 'rahasia123',
            { expiresIn: '7d' }
        );

        return {
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    desa: user.desa
                },
                accessToken
            }
        };
    }

    async register(userData) {
        const userEmail = (userData?.email || '').toLowerCase().trim();
        const userPassword = userData?.password;
        const userName = (userData?.name || '').trim();
        const userRole = (userData?.role || 'PETANI').toUpperCase();
        const userDesa = userData?.desa ? userData.desa.trim() : '-';
        const notifEmail = userData?.notificationEmail ? userData.notificationEmail.trim() : null;

        const existing = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existing) throw new Error('Email sudah terdaftar');

        const user = await prisma.user.create({
            data: {
                email: userEmail,
                password: userPassword,
                name: userName,
                role: userRole,
                desa: userDesa
            }
        });

        // Kirim email notifikasi selamat datang / akun baru via Gmail
        let notificationResult = null;
        try {
            notificationResult = await emailService.sendNewUserRegistrationNotification(
                user,
                'Registrasi Mandiri Pengguna',
                notifEmail
            );
        } catch (mailErr) {
            console.warn('⚠️ Gagal mengirim notifikasi email akun baru:', mailErr.message);
        }

        return {
            success: true,
            message: 'Registrasi berhasil! Akun Anda telah siap digunakan.',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                desa: user.desa
            },
            notification: notificationResult
        };
    }

    async getCurrentUser(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User tidak ditemukan');

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            desa: user.desa
        };
    }

    async refreshToken(tokenOrEmail) {
        let user = null;
        if (tokenOrEmail) {
            try {
                const decoded = jwt.verify(tokenOrEmail, process.env.JWT_SECRET || 'rahasia123', { ignoreExpiration: true });
                if (decoded?.id) {
                    user = await prisma.user.findUnique({ where: { id: decoded.id } });
                }
            } catch (e) {
                // Ignore token error and try searching by email
            }

            if (!user) {
                user = await prisma.user.findFirst({
                    where: { email: tokenOrEmail }
                });
            }
        }

        if (!user) throw new Error('User tidak ditemukan');

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                desa: user.desa
            },
            process.env.JWT_SECRET || 'rahasia123',
            { expiresIn: '30d' }
        );

        return {
            success: true,
            message: 'Token berhasil diperbarui',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    desa: user.desa
                },
                accessToken
            }
        };
    }
}

module.exports = new AuthService();