const nodemailer = require('nodemailer');
const prisma = require('../config/database');

/**
 * Service Notifikasi Email Platform Padi Desa
 * Mengirim notifikasi email melalui mukhyishabil@gmail.com
 */
class EmailService {
    constructor() {
        this.defaultSender = process.env.EMAIL_USER || 'mukhyishabil@gmail.com';
        this.fromHeader = process.env.EMAIL_FROM || `"Platform Padi Desa" <${this.defaultSender}>`;
    }

    /**
     * Mendapatkan Nodemailer Transporter
     * Menggunakan Gmail SMTP (smtp.gmail.com)
     */
    getTransporter() {
        const user = process.env.EMAIL_USER || 'mukhyishabil@gmail.com';
        const pass = process.env.EMAIL_PASS;

        if (!pass || pass.trim() === '') {
            return null;
        }

        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '465'),
            secure: process.env.EMAIL_SECURE !== 'false',
            auth: {
                user,
                pass: pass.trim(),
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });
    }

    /**
     * Format tanggal Indonesia
     */
    formatDateIndo(date = new Date()) {
        try {
            return new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta'
            }).format(new Date(date)) + ' WIB';
        } catch {
            return new Date(date).toLocaleString('id-ID');
        }
    }

    /**
     * Generate Template HTML Email Notifikasi Lahan Baru
     */
    generateNewFarmEmailHtml({ farm, farmer, creator, recipientName }) {
        const farmName = farm.name || 'Lahan Pertanian';
        const farmLuas = farm.luas !== undefined ? `${farm.luas} Hektar (Ha)` : '-';
        const farmDesa = farm.desa || 'Desa Sukamakmur';
        const farmLocation = farm.location || 'Wilayah Pertanian Desa';
        const farmNotes = farm.notes ? farm.notes : 'Tidak ada catatan tambahan';
        const farmerName = farmer?.name ? `${farmer.name} (${farmer.email || 'Petani'})` : 'Belum Ditentukan';
        const creatorName = creator?.name ? `${creator.name} (${creator.role || 'Admin'})` : 'Aparatur Desa';
        const timeString = this.formatDateIndo(farm.createdAt || new Date());
        const greetingName = recipientName ? recipientName : 'Bapak/Ibu Pengguna';

        return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifikasi Penambahan Lahan Baru</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 10px;">
        <tr>
            <td align="center">
                <!-- Container Card -->
                <table role="presentation" width="100%" style="max-width: 600px; background: #111827; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%); padding: 32px 30px; text-align: center;">
                            <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">🌾</div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                                PLATFORM PADI DESA
                            </h1>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-weight: 400; letter-spacing: 0.3px;">
                                Sistem Informasi & Manajemen Pertanian Padi Berkelanjutan
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 30px;">
                            
                            <!-- Status Badge -->
                            <div style="display: inline-block; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 50px; padding: 6px 16px; margin-bottom: 20px;">
                                <span style="color: #4ade80; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                                    📢 Pemberitahuan Sistem
                                </span>
                            </div>

                            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                                Lahan Pertanian Baru Telah Ditambahkan!
                            </h2>

                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                                Halo <strong style="color: #f1f5f9;">${greetingName}</strong>,<br>
                                Kami menginformasikan kepada seluruh pengguna platform bahwa sebuah lahan pertanian baru telah berhasil didaftarkan ke dalam sistem Platform Padi Desa.
                            </p>

                            <!-- Highlight Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #1e293b; border-left: 4px solid #22c55e; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                                            🌾 ${farmName}
                                        </div>
                                        <div style="font-size: 13px; color: #94a3b8;">
                                            Luas: <strong style="color: #4ade80;">${farmLuas}</strong> • Desa: <strong style="color: #f1f5f9;">${farmDesa}</strong>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Details Table -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; width: 38%;">
                                        🏷️ Nama Lahan
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9; font-weight: 600;">
                                        ${farmName}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        📐 Luas Lahan
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #4ade80; font-weight: 600;">
                                        ${farmLuas}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        📍 Wilayah / Desa
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9;">
                                        ${farmDesa}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        🗺️ Lokasi / Alamat
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9;">
                                        ${farmLocation}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        👨‍🌾 Petani Penanggung Jawab
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9; font-weight: 600;">
                                        ${farmerName}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        ✍️ Ditambahkan Oleh
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #f1f5f9;">
                                        ${creatorName}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #64748b;">
                                        📝 Catatan Lahan
                                    </td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #94a3b8; font-style: italic;">
                                        "${farmNotes}"
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; color: #64748b;">
                                        🕒 Waktu Penambahan
                                    </td>
                                    <td style="padding: 10px 12px; color: #94a3b8;">
                                        ${timeString}
                                    </td>
                                </tr>
                            </table>

                            <!-- Callout Box -->
                            <div style="background: rgba(34, 197, 94, 0.05); border: 1px dashed rgba(34, 197, 94, 0.25); border-radius: 10px; padding: 14px 18px; margin-bottom: 28px;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #86efac;">
                                    💡 <strong>Langkah Selanjutnya:</strong> Lahan ini sekarang siap untuk pencatatan penanaman bibit padi, penjadwalan pemupukan & irigasi, serta estimasi panen di dashboard platform.
                                </p>
                            </div>

                            <!-- Button Action -->
                            <div style="text-align: center; margin: 30px 0 10px 0;">
                                <a href="http://localhost:5500/pages/farms.html" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 50px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.35); letter-spacing: 0.3px;">
                                    Lihat Data Lahan di Platform &rarr;
                                </a>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #0f172a; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                            <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                                Notifikasi otomatis dikirimkan melalui: <strong style="color: #94a3b8;">mukhyishabil@gmail.com</strong>
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #475569;">
                                Platform Padi Desa • Mendukung Modernisasi dan Swasembada Padi Indonesia
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();
    }

    /**
     * Generate Template Plain Text (fallback)
     */
    generateNewFarmEmailText({ farm, farmer, creator, recipientName }) {
        const farmName = farm.name || 'Lahan Pertanian';
        const farmLuas = farm.luas !== undefined ? `${farm.luas} Hektar (Ha)` : '-';
        const farmDesa = farm.desa || 'Desa Sukamakmur';
        const farmLocation = farm.location || 'Wilayah Pertanian Desa';
        const farmNotes = farm.notes ? farm.notes : 'Tidak ada catatan tambahan';
        const farmerName = farmer?.name ? `${farmer.name} (${farmer.email || 'Petani'})` : 'Belum Ditentukan';
        const creatorName = creator?.name ? `${creator.name} (${creator.role || 'Admin'})` : 'Aparatur Desa';
        const timeString = this.formatDateIndo(farm.createdAt || new Date());
        const greetingName = recipientName ? recipientName : 'Bapak/Ibu Pengguna';

        return `
🌾 PLATFORM PADI DESA - PEMBERITAHUAN LAHAN BARU 🌾
=====================================================

Halo ${greetingName},

Sebuah lahan pertanian baru telah berhasil ditambahkan ke dalam sistem Platform Padi Desa.

RINCIAN LAHAN PERTANIAN:
- Nama Lahan     : ${farmName}
- Luas Lahan     : ${farmLuas}
- Wilayah / Desa : ${farmDesa}
- Lokasi / Alamat: ${farmLocation}
- Petani Pengelola: ${farmerName}
- Ditambahkan Oleh: ${creatorName}
- Catatan        : ${farmNotes}
- Waktu Registrasi: ${timeString}

Lahan ini kini aktif dan dapat dipantau melalui aplikasi Platform Padi Desa:
http://localhost:5500/pages/farms.html

=====================================================
Email ini dikirimkan secara otomatis oleh Platform Padi Desa
melalui akun: mukhyishabil@gmail.com
        `.trim();
    }

    /**
     * Memeriksa apakah sebuah alamat email valid dan dapat dikirim melalui internet publik.
     * Mengabaikan email internal/demo seperti @desa.local, @example.com, dsb
     * agar tidak menyebabkan pantulan (bounce) 'Mail Delivery Subsystem: Alamat tidak dapat ditemukan'.
     *
     * @param {string} email
     * @returns {boolean}
     */
    isDeliverableEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const clean = email.trim().toLowerCase();

        // Format email dasar
        const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        const match = clean.match(emailRegex);
        if (!match) return false;

        const domain = match[1];

        // Daftar domain palsu/internal/demo yang tidak memiliki MX record di internet publik
        const blockedDomains = [
            'desa.local',
            'example.com',
            'example.org',
            'example.net',
            'test.com',
            'test.local',
            'dummy.local'
        ];
        if (blockedDomains.includes(domain)) return false;

        // TLD lokal/internal
        const blockedTlds = ['local', 'internal', 'localhost', 'test', 'example', 'invalid', 'lan', 'localdomain'];
        const domainParts = domain.split('.');
        const tld = domainParts[domainParts.length - 1];
        if (blockedTlds.includes(tld)) return false;

        return true;
    }

    /**
     * Mengirim notifikasi penambahan lahan baru ke semua pengguna yang memiliki email valid,
     * ke custom recipient (jika dimasukkan saat tambah lahan), dan ke mukhyishabil@gmail.com
     *
     * @param {Object} farm - Data lahan yang baru dibuat
     * @param {Object|String} creator - Data pembuat (user object atau userId)
     * @param {String|Array} customRecipient - Email Gmail khusus untuk menerima notifikasi
     */
    async sendNewFarmNotification(farm, creator = null, customRecipient = null) {
        try {
            console.log('\n===============================================================');
            console.log('🌾 [EMAIL NOTIFICATION] Memulai proses notifikasi penambahan lahan...');
            console.log(`🌾 Lahan: "${farm.name}" (${farm.luas} Ha)`);
            if (customRecipient) {
                console.log(`🎯 [CUSTOM NOTIFIKASI] Diberikan email tujuan khusus: ${customRecipient}`);
            }

            // 0. Cek apakah notifikasi email diaktifkan
            if (process.env.EMAIL_NOTIFICATION_ENABLED === 'false') {
                console.log('ℹ️ [EMAIL NOTIFICATION] Dinonaktifkan melalui EMAIL_NOTIFICATION_ENABLED=false di .env');
                return {
                    success: true,
                    disabled: true,
                    message: 'Notifikasi email dinonaktifkan di .env'
                };
            }

            // 1. Dapatkan data creator jika masih berupa ID
            let creatorData = creator;
            if (typeof creator === 'string') {
                try {
                    creatorData = await prisma.user.findUnique({
                        where: { id: creator },
                        select: { id: true, name: true, email: true, role: true }
                    });
                } catch (e) {
                    creatorData = { name: 'Admin', role: 'ADMIN' };
                }
            }

            // 2. Dapatkan data petani pengelola jika ada
            let farmerData = farm.user;
            if (!farmerData && farm.userId) {
                try {
                    farmerData = await prisma.user.findUnique({
                        where: { id: farm.userId },
                        select: { id: true, name: true, email: true, role: true }
                    });
                } catch (e) {
                    farmerData = null;
                }
            }

            // 3. Ambil seluruh pengguna aktif dari database
            const allUsers = await prisma.user.findMany({
                where: { isActive: true },
                select: { id: true, name: true, email: true, role: true }
            });

            // 4. Kumpulkan daftar penerima unik yang memiliki email publik valid
            const recipientMap = new Map();

            // Masukkan email custom jika diinputkan oleh pengguna saat menambah lahan
            if (customRecipient) {
                const customEmails = Array.isArray(customRecipient)
                    ? customRecipient
                    : String(customRecipient).split(/[,;\s]+/).filter(Boolean);

                for (const em of customEmails) {
                    const cleanEmail = em.trim();
                    if (this.isDeliverableEmail(cleanEmail)) {
                        recipientMap.set(cleanEmail.toLowerCase(), {
                            email: cleanEmail,
                            name: `Penerima Notifikasi Khusus (${cleanEmail})`,
                            role: 'PENERIMA_NOTIFIKASI'
                        });
                        console.log(`✅ [CUSTOM NOTIFIKASI GMAIL] Berhasil menambahkan email tujuan: ${cleanEmail}`);
                    } else {
                        console.warn(`⚠️ [CUSTOM NOTIFIKASI] Email ${cleanEmail} bukan email publik yang dapat dikirim.`);
                    }
                }
            }

            // Masukkan hanya user yang memiliki email publik valid (BUKAN @desa.local atau domain palsu)
            for (const u of allUsers) {
                if (u.email && this.isDeliverableEmail(u.email)) {
                    recipientMap.set(u.email.toLowerCase().trim(), {
                        email: u.email.trim(),
                        name: u.name,
                        role: u.role
                    });
                } else if (u.email) {
                    console.log(`⏩ [SKIP EMAIL DUMMY] Mengabaikan email demo/lokal: ${u.email} (${u.name}) agar tidak bounce di Gmail.`);
                }
            }

            // Pastikan email pengelola (mukhyishabil@gmail.com) terdaftar jika valid
            const primaryEmail = this.defaultSender;
            if (this.isDeliverableEmail(primaryEmail) && !recipientMap.has(primaryEmail.toLowerCase())) {
                recipientMap.set(primaryEmail.toLowerCase(), {
                    email: primaryEmail,
                    name: 'Mukhyi Shabil (Admin / Pengelola)',
                    role: 'ADMIN_OPERATOR'
                });
            }

            const recipients = Array.from(recipientMap.values());
            const recipientEmails = recipients.map(r => r.email);

            console.log(`📬 Total penerima valid: ${recipients.length} alamat email:`);
            recipients.forEach((r, idx) => {
                console.log(`   ${idx + 1}. ${r.name} <${r.email}> [${r.role}]`);
            });

            if (recipientEmails.length === 0) {
                console.log('ℹ️ Tidak ada penerima email publik yang valid. Pengiriman dibatalkan.');
                return {
                    success: true,
                    count: 0,
                    message: 'Tidak ada alamat email penerima publik yang valid.'
                };
            }

            // 5. Cek transporter (apakah EMAIL_PASS sudah disetel)
            const transporter = this.getTransporter();
            const subject = `🌾 [Platform Padi Desa] Lahan Baru Ditambahkan: ${farm.name} (${farm.luas} Ha)`;

            if (!transporter) {
                // Mode Simulasi / Menunggu App Password
                console.log('---------------------------------------------------------------');
                console.log('ℹ️ [MODE SIMULASI / MENUNGGU EMAIL_PASS]');
                console.log(`📧 Pengirim  : ${this.defaultSender}`);
                console.log(`📬 Subjek    : ${subject}`);
                console.log('===============================================================\n');

                return {
                    success: true,
                    simulated: true,
                    sender: this.defaultSender,
                    count: recipients.length,
                    recipients: recipientEmails,
                    message: `Notifikasi lahan disimulasikan ke ${recipients.length} pengguna`
                };
            }

            // 6. Mode Pengiriman Nyata melalui Gmail SMTP
            console.log(`🚀 Mengirim email via Gmail SMTP (${this.defaultSender})...`);

            // Generate HTML & Text
            const htmlContent = this.generateNewFarmEmailHtml({
                farm,
                farmer: farmerData,
                creator: creatorData,
                recipientName: 'Pengguna Platform Padi Desa'
            });

            const textContent = this.generateNewFarmEmailText({
                farm,
                farmer: farmerData,
                creator: creatorData,
                recipientName: 'Pengguna Platform Padi Desa'
            });

            // Pisahkan primary receiver dengan BCC (hanya kirim BCC untuk email selain defaultSender agar tidak dobel)
            const bccList = recipientEmails.filter(
                e => e.toLowerCase() !== this.defaultSender.toLowerCase()
            );

            const mailOptions = {
                from: this.fromHeader,
                to: this.defaultSender,
                subject: subject,
                text: textContent,
                html: htmlContent
            };

            if (bccList.length > 0) {
                mailOptions.bcc = bccList;
            }

            const info = await transporter.sendMail(mailOptions);

            console.log(`✅ [BERHASIL] Email notifikasi terkirim tanpa bounce! MessageId: ${info.messageId}`);
            console.log('===============================================================\n');

            return {
                success: true,
                simulated: false,
                messageId: info.messageId,
                sender: this.defaultSender,
                count: recipients.length,
                recipients: recipientEmails,
                message: `Email notifikasi lahan berhasil dikirim ke ${recipients.length} pengguna melalui ${this.defaultSender}`
            };

        } catch (error) {
            console.error('❌ [EMAIL NOTIFICATION ERROR]:', error.message);
            console.log('===============================================================\n');
            return {
                success: false,
                error: error.message,
                message: `Gagal mengirim email: ${error.message}`
            };
        }
    }
}

module.exports = new EmailService();
