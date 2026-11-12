const axios = require('axios');
const prisma = require('../../config/database');

class AIVisionService {
    async analyzeImage(imageBuffer, mimeType, question, user, requestedModel = null) {
        const apiKey = process.env.GEMINI_API_KEY;

        let userObj = typeof user === 'object' && user !== null ? { ...user } : { role: 'PETANI' };
        try {
            let dbUser = null;
            if (userObj.id) {
                dbUser = await prisma.user.findUnique({ where: { id: userObj.id } });
            }
            if (!dbUser && userObj.email) {
                dbUser = await prisma.user.findUnique({ where: { email: userObj.email } });
            }
            if (dbUser) {
                userObj = { ...userObj, ...dbUser };
            }
        } catch (dbErr) {
            console.warn('⚠️ Gagal mengambil user DB di ai-vision:', dbErr.message);
        }

        const role = (userObj.role || 'PETANI').toUpperCase();
        const defaultRoleName = role === 'ADMIN' ? 'Admin' : role === 'KEPALA_DESA' ? 'Kepala Desa' : 'Petani';
        const name = (userObj.name && userObj.name.trim() !== '') ? userObj.name.trim() : defaultRoleName;
        const desa = userObj.desa || (role === 'ADMIN' ? 'Pusat' : 'Desa Sukamakmur');

        if (!apiKey || apiKey.trim() === '') {
            return {
                success: false,
                message: 'GEMINI_API_KEY belum diatur di file .env'
            };
        }

        const userQuestion = question && question.trim() !== ''
            ? question.trim()
            : 'Analisis kondisi tanaman padi / objek pada foto ini secara lengkap.';

        const roleContext = role === 'ADMIN'
            ? `Pengguna adalah ADMIN PLATFORM (${name}). Berikan analisis diagnosis teknis yang akurat dan cocok untuk dokumentasi sistem pertanian.`
            : role === 'KEPALA_DESA'
                ? `Pengguna adalah KEPALA DESA (${name}) dari ${desa}. Berikan diagnosis tanaman serta rekomendasi penanganan baik untuk petani maupun koordinasi penyuluhan di tingkat desa.`
                : `Pengguna adalah PETANI (${name}) dari ${desa}. Berikan diagnosis dan langkah penanganan langsung yang sangat praktis dan mudah dikerjakan di sawah.`;

        const fullPrompt = `Anda adalah AI Assistant dan Pakar Pertanian Padi resmi untuk "Platform Padi Desa".
Tugas Anda adalah menganalisis gambar yang dikirimkan oleh pengguna dan memberikan penjelasan yang solutif.

KONTEKS PENGGUNA:
${roleContext}

Pertanyaan Pengguna: "${userQuestion}"

PANDUAN ANALISIS:
- Jika gambar berkaitan dengan tanaman padi, daun, batang, bulir, hama, penyakit, atau lahan pertanian:
  1. Identifikasi kondisi tanaman atau masalah yang terlihat (misal: serangan hama wereng/penggerek, penyakit blas/hawar daun, kekurangan nutrisi N/P/K, atau fase pertumbuhan).
  2. Berikan diagnosis dan penjelasan penyebabnya secara jelas.
  3. Berikan rekomendasi langkah penanganan praktis yang dapat langsung diterapkan oleh petani (langkah pencegahan, pemupukan berimbang, pengaturan air, atau pengendalian tepat guna).
- Jika gambar bukan tentang pertanian/tanaman padi:
  Sebutkan secara singkat dan ramah apa objek pada gambar, lalu ajak pengguna untuk berkonsultasi seputar foto tanaman atau lahan padi.

ATURAN FORMAT & PENULISAN:
- DILARANG menggunakan kata "maaf" atau "mohon maaf" dalam bentuk apa pun.
- DILARANG menggunakan tanda bintang (* atau **), garis horizontal (---), atau simbol pemisah tabel (|).
- Tulis jawaban dalam bahasa Indonesia dengan teks yang rapi, runtut, mudah dipahami (gunakan penomoran 1., 2., 3. atau tanda minus - biasa).`;

        // Daftar model vision yang dicoba secara berurutan
        let modelsToTry = [
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-flash-latest',
            'gemini-3.8-flash',
            'gemini-3.5-flash'
        ];

        // Jika user secara spesifik meminta model Gemini tertentu
        if (requestedModel && typeof requestedModel === 'string') {
            const clean = requestedModel.toLowerCase();
            if (clean.includes('2.0') || clean.includes('gemini-2')) {
                modelsToTry = ['gemini-2.0-flash', ...modelsToTry];
            } else if (clean.includes('pro')) {
                modelsToTry = ['gemini-1.5-pro', ...modelsToTry];
            } else if (clean.includes('flash')) {
                modelsToTry = ['gemini-1.5-flash', ...modelsToTry];
            }
        }

        // Hapus duplikat
        modelsToTry = [...new Set(modelsToTry)];

        let lastError = null;

        for (const model of modelsToTry) {
            try {
                const base64Image = imageBuffer.toString('base64');

                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        contents: [{
                            parts: [
                                { text: fullPrompt },
                                {
                                    inline_data: {
                                        mime_type: mimeType || 'image/jpeg',
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 60000,
                    }
                );

                const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!candidate) {
                    throw new Error('Respon model kosong');
                }

                return {
                    success: true,
                    data: {
                        question: userQuestion,
                        answer: this.cleanAnswer(candidate),
                        model: model,
                        modelName: `Gemini Vision (${model})`,
                        provider: 'Google DeepMind',
                        icon: '📷✨',
                        isDummy: false
                    }
                };
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Model ${model} gagal:`, error.response?.data?.error?.message || error.message);
                // Coba model berikutnya jika gagal
            }
        }

        console.error('❌ Semua model Gemini Vision gagal:', lastError?.response?.data || lastError?.message);
        return {
            success: false,
            message: 'Gagal menganalisis gambar: ' + (lastError?.response?.data?.error?.message || lastError?.message || 'Terjadi kesalahan')
        };
    }

    cleanAnswer(text) {
        if (!text) return '';
        let cleaned = text;

        // Ubah <br> tag ke baris baru
        cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

        // Hapus garis horizontal (---, ***, ___)
        cleaned = cleaned.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');

        // Hapus semua tanda bintang (*)
        cleaned = cleaned.replace(/\*/g, '');

        // Hapus garis pemisah tabel markdown (|---|---|)
        cleaned = cleaned.replace(/^[\s]*\|.*\|[\s]*$/gm, function (line) {
            if (line.includes('---')) return '';
            return line.replace(/\|/g, ' ').trim();
        });

        // Hapus sisa karakter '|'
        cleaned = cleaned.replace(/\|/g, '');

        // Hapus header markdown (## 1. -> 1.)
        cleaned = cleaned.replace(/^[\s]*#+\s*/gm, '');

        // Hapus kata maaf / mohon maaf di awal kalimat atau jawaban
        cleaned = cleaned.replace(/^(\s*🌾\s*)?(mohon\s+)?maaf[,.\s-]+/i, '$1');
        cleaned = cleaned.replace(/([.!?\n]\s*)(mohon\s+)?maaf[,.\s-]+/gi, '$1');
        cleaned = cleaned.replace(/\b(mohon\s+)?maaf,?\s*/gi, '');

        // Rapikan huruf kapital di awal kalimat jika kata maaf dihapus
        cleaned = cleaned.replace(/^([a-z])/g, (c) => c.toUpperCase());
        cleaned = cleaned.replace(/^(🌾\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

        // Rapikan baris kosong berturut-turut yang berlebihan
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        return cleaned.trim();
    }
}

module.exports = new AIVisionService();
