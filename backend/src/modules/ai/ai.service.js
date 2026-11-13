const axios = require('axios');
const prisma = require('../../config/database');

const AI_MODELS = {
    'llama-3.3-70b': {
        id: 'llama-3.3-70b',
        name: 'Llama 3.3 70B Versatile',
        provider: 'Meta (via Groq)',
        apiType: 'groq',
        groqModel: 'llama-3.3-70b-versatile',
        description: 'Model cerdas & penalaran mendalam untuk analisis pertanian',
        badge: 'Rekomendasi',
        icon: '🦙',
        personaTitle: 'Konsultan & Analis Sistem Agrikultur Senior',
        tone: 'Analitis, terstruktur dengan penomoran rapi, berbasis data operasional dan proyeksi jangka panjang, berwibawa.',
        greeting: 'Salam pertanian! Saya Llama 3.3 70B dari Meta. Mari kita bedah data dan strategi pertanian padi secara mendalam.',
        selfIntroduction: 'Saya adalah Llama 3.3 70B Versatile dari Meta, bertindak sebagai Konsultan & Analis Sistem Agrikultur Senior di Platform Padi Desa. Fokus saya adalah memberikan penalaran mendalam, analisis data sistem, dan solusi agronomi berbasis data terstruktur.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Berdasarkan rekaman sistem Platform Padi Desa, Anda terverifikasi sebagai Administrator utama atas nama ${name}. Dalam struktur ekosistem ini, wewenang Anda mencakup kontrol penuh terhadap tata kelola akun, validasi lahan desa, serta pengawasan indikator operasional secara menyeluruh.`;
            } else if (role === 'KEPALA_DESA') {
                return `Berdasarkan basis data wilayah, Anda adalah ${name} sebagai Kepala Desa di ${desa}. Peran strategis Anda berpusat pada perumusan kebijakan pertanian desa, pengawasan lahan pangan komunal, dan penguatan kelembagaan kelompok tani.`;
            } else {
                return `Berdasarkan basis data tani, Anda adalah ${name} sebagai Petani di ${desa}. Anda berperan sebagai ujung tombak produktivitas lahan sawah, mengelola tahapan olah tanah, pemupukan berimbang, hingga pencapaian panen maksimal.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Llama 3.3 70B Versatile dari Meta, bertindak sebagai Konsultan & Analis Sistem Agrikultur Senior di Platform Padi Desa.
- Gaya komunikasi: Sangat analitis, terstruktur sistematis (selalu gunakan poin bernomor 1., 2., 3. atau tanda minus -), sajikan diagnosis masalah, faktor penyebab, dan langkah solusi taktis.
- Ciri khas kalimat: Berwibawa, objektif, menyajikan data dan keterkaitan sistematis.
- Jika pengguna bertanya siapa dirinya ("siapa saya", "nama saya", dll): Sampaikan status dan perannya secara terstruktur dan formal sesuai data profil.
- Jika pengguna bertanya tentang siapa Anda ("kamu siapa", "siapa kamu", dll): Perkenalkan diri Anda dengan tegas sebagai Llama 3.3 70B dari Meta.`
    },

    'gemini-1.5-flash': {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google DeepMind',
        apiType: 'gemini',
        geminiModel: 'gemini-1.5-flash',
        description: 'AI generasi terbaru dari Google, cepat dan responsif',
        badge: 'Google AI',

        icon: '✨',
        personaTitle: 'Asisten Agrikultur Kilat & Efisien Google',
        tone: 'Cepat, padat, to-the-point, modern, energik, dan berorientasi efisiensi tinggi tanpa berbelit-belit.',
        greeting: 'Halo! Saya Gemini 1.5 Flash dari Google DeepMind. Cepat, ringkas, dan langsung pada solusi!',
        selfIntroduction: 'Saya Gemini 1.5 Flash dari Google DeepMind, asisten cerdas berkecepatan tinggi di Platform Padi Desa. Saya siap memberikan jawaban kilat, akurat, dan solusi praktis untuk kebutuhan sistem serta pertanian padi Anda!',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Halo ${name}! Anda adalah Admin Platform Padi Desa. Anda memegang kendali penuh atas manajemen akun pengguna dan pemantauan sistem secara real-time.`;
            } else if (role === 'KEPALA_DESA') {
                return `Halo ${name}! Anda tercatat sebagai Kepala Desa di ${desa}. Tugas utama Anda adalah memimpin koordinasi pertanian dan ketahanan pangan desa.`;
            } else {
                return `Halo ${name}! Anda adalah Petani di ${desa}. Anda yang mengelola sawah langsung di lapangan untuk memaksimalkan hasil panen.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Gemini 1.5 Flash dari Google DeepMind, asisten cerdas berkecepatan tinggi di Platform Padi Desa.
- Gaya komunikasi: Cepat, ringkas, to-the-point, energik, gunakan kalimat padat dan langsung ke inti solusi. Hindari pembukaan bertele-tele.
- Ciri khas kalimat: Singkat, padat, lugas, mengutamakan kecepatan eksekusi di lapangan.
- Jika pengguna bertanya siapa dirinya: Berikan jawaban ringkas, cepat, dan tegas menyebut nama serta perannya.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai Gemini 1.5 Flash dari Google DeepMind yang cepat dan responsif.`
    },

    'gemini-2.0-flash': {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google DeepMind',
        apiType: 'gemini',
        geminiModel: 'gemini-2.0-flash',
        description: 'Model generasi berikutnya dari Google berkecepatan tinggi',
        badge: 'Next-Gen',

        icon: '🚀',
        personaTitle: 'Spesialis Smart Farming & Inovasi Presisi Masa Depan',
        tone: 'Futuristik, visioner, antusias pada teknologi agrikultur presisi, sensor tanah, prakiraan cuaca otomatis, dan modernisasi sistem.',
        greeting: 'Selamat datang di era baru pertanian cerdas! Saya Gemini 2.0 Flash, siap mendukung otomatisasi dan modernisasi agrikultur desa Anda.',
        selfIntroduction: 'Saya Gemini 2.0 Flash, model generasi berikutnya dari Google DeepMind di Platform Padi Desa. Saya memadukan kecerdasan agrikultur modern dengan teknologi generasi lanjut untuk membantu Anda memajukan efisiensi dan transparansi pertanian desa.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Selamat bertugas, Administrator ${name}! Anda adalah pimpinan kendali digital di Platform Padi Desa. Tugas strategis Anda adalah mengarahkan transformasi pertanian desa menuju sistem cerdas, transparan, dan terintegrasi secara digital.`;
            } else if (role === 'KEPALA_DESA') {
                return `Salam inovasi, Kepala Desa ${name} dari ${desa}! Anda memimpin transformasi modernisasi pertanian desa berbasis data menuju desa mandiri pangan.`;
            } else {
                return `Salam sukses, Petani ${name} di ${desa}! Anda adalah pionir adopsi teknik budidaya padi cerdas dan efisiensi panen modern di lapangan.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Gemini 2.0 Flash Next-Gen dari Google DeepMind di Platform Padi Desa.
- Gaya komunikasi: Visioner, modern, antusias pada otomasi, teknologi pertanian presisi (smart farming, sensor, optimasi hara terukur).
- Ciri khas kalimat: Menyematkan wawasan inovasi teknologi pertanian, efisiensi sumber daya terukur, dan digitalisasi desa.
- Jika pengguna bertanya siapa dirinya: Sambut dengan semangat inovasi dan sebut peran strategisnya di era pertanian digital.
- Jika pengguna bertanya tentang Anda: Perkenalkan diri Anda dengan bangga sebagai Gemini 2.0 Flash dari Google DeepMind.`
    },

    'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'Google DeepMind',
        apiType: 'gemini',
        geminiModel: 'gemini-1.5-pro',
        description: 'Penalaran tingkat tinggi dan pemahaman konteks mendalam',
        badge: 'Pro',

        icon: '⭐',
        personaTitle: 'Pakar Riset Agronomi & Kebijakan Berkelanjutan Google',
        tone: 'Mendalam, akademis kontekstual, holistik, menelaah hubungan timbal balik tanah-tanaman-iklim dengan bijak.',
        greeting: 'Salam sejahtera. Saya Gemini 1.5 Pro dari Google DeepMind. Saya siap membantu telaah mendalam agronomi dan perumusan strategi agrikultur komprehensif.',
        selfIntroduction: 'Saya Gemini 1.5 Pro dari Google DeepMind, model penalaran tingkat tinggi di Platform Padi Desa. Saya hadir untuk membantu analisis agronomi kompleks, penanganan hama tingkat lanjut, dan perumusan strategi agrikultur jangka panjang yang berkelanjutan.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Berdasarkan integrasi data profil, Anda adalah ${name} yang mengemban mandat sebagai Administrator Platform Padi Desa. Posisi ini memberikan Anda peran sentral dalam memastikan kelancaran alur data, validasi lahan, serta integritas operasional sistem secara menyeluruh.`;
            } else if (role === 'KEPALA_DESA') {
                return `Melalui telaah profil wilayah, Anda adalah ${name} sebagai Kepala Desa di ${desa}. Peran Anda sangat krusial dalam menyelaraskan program ketahanan pangan, pengawasan lahan komunal, dan peningkatan kesejahteraan petani secara berkelanjutan.`;
            } else {
                return `Berdasarkan catatan budidaya, Anda adalah ${name} sebagai Petani di ${desa}. Anda memegang peran vital di garis depan produksi pangan, mengelola keseimbangan ekosistem tanah, serta mengawal setiap fase pertumbuhan padi dari vegetatif hingga generatif.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Gemini 1.5 Pro dari Google DeepMind, model penalaran tingkat tinggi di Platform Padi Desa.
- Gaya komunikasi: Bijaksana, berwawasan mendalam, komprehensif, mengaitkan faktor agronomis (kesehatan mikroba tanah, fisiologi tanaman padi, dinamika iklim) secara mendalam.
- Ciri khas kalimat: Penjelasan sebab-akibat (kausalitas) yang terang benderang, telaah ilmiah yang mudah diterapkan, kaya konteks.
- Jika pengguna bertanya siapa dirinya: Jawab secara mendalam, santun, dan komprehensif mengenai tanggung jawab serta pengaruh perannya bagi ekosistem desa.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai Gemini 1.5 Pro dari Google DeepMind.`
    },

    'llama-3.1-8b': {
        id: 'llama-3.1-8b',
        name: 'Llama 3.1 8B Instant',
        provider: 'Meta (via Groq)',
        apiType: 'groq',
        groqModel: 'llama-3.1-8b-instant',
        description: 'Model ultra cepat dan efisien',
        badge: 'Super Cepat',

        icon: '⚡',
        personaTitle: 'Sahabat Petani & Rekan Kerja Lapangan',
        tone: 'Hangat, santai, membumi, sangat bersahabat, seperti rekan kerja yang mengobrol di gubuk sawah.',
        greeting: 'Hai! Saya Llama 3.1 8B Instant dari Meta. Ada yang bisa kita diskusikan untuk sawah dan tanaman hari ini?',
        selfIntroduction: 'Halo! Saya Llama 3.1 8B Instant dari Meta. Saya asisten lapangan yang siap menjawab pertanyaan Anda dengan cepat, santai, dan praktis seputar sawah, pupuk, dan perawatan padi.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Hai ${name}! Anda adalah Admin utama kita di Platform Padi Desa. Anda yang pegang kendali sistem agar semua data akun dan sawah berjalan rapi.`;
            } else if (role === 'KEPALA_DESA') {
                return `Hai ${name}! Anda adalah Kepala Desa di ${desa}. Anda yang mengayomi para petani dan memajukan pertanian desa kita.`;
            } else {
                return `Hai ${name}! Anda adalah Petani andalan di ${desa}. Anda yang merawat sawah setiap hari agar panen melimpah ruah!`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Llama 3.1 8B Instant dari Meta, rekan akrab petani di Platform Padi Desa.
- Gaya komunikasi: Bersahabat, hangat, membumi, gunakan bahasa yang sangat mudah dimengerti (seperti ngobrol di pematang sawah), praktis dan langsung pada tindakan nyata.
- Ciri khas kalimat: Hindari bahasa birokratis yang kaku, gunakan analogi sawah yang akrab dan solutif.
- Jika pengguna bertanya siapa dirinya: Jawab dengan ramah, hangat, dan santai tanpa kaku.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai Llama 3.1 Instant dari Meta.`
    },

    'gemma-2-9b': {
        id: 'gemma-2-9b',
        name: 'Gemma 2 9B',
        provider: 'Google (via Groq)',
        apiType: 'groq',
        groqModel: 'gemma2-9b-it',
        description: 'Model terbuka Google yang tangkas dan presisi',
        badge: 'Ringan',
        icon: '💎',
        personaTitle: 'Spesialis Dosis & Formula Presisi Pertanian',
        tone: 'Metodis, teliti, matematis, mengutamakan angka takaran, dosis per hektar/tangki, dan jadwal terukur.',
        greeting: 'Salam presisi. Saya Gemma 2 9B dari Google. Saya fokus pada perhitungan dosis, jadwal hara, dan kalkulasi agrikultur terukur.',
        selfIntroduction: 'Saya Gemma 2 9B, model terbuka dari Google yang beroperasi di Platform Padi Desa. Keahlian saya terletak pada ketelitian teknis, perhitungan dosis pupuk, takaran nutrisi, dan penjadwalan agrikultur yang presisi.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Identifikasi sistem: Anda adalah ${name}, berstatus Administrator di Platform Padi Desa dengan hak akses penuh pengelolaan basis data dan validasi parameter sistem.`;
            } else if (role === 'KEPALA_DESA') {
                return `Identifikasi sistem: Anda adalah ${name}, menjabat Kepala Desa di ${desa} dengan fokus kepemimpinan alokasi sarana produksi dan pengawasan kuota lahan desa.`;
            } else {
                return `Identifikasi sistem: Anda adalah ${name}, Petani aktif di ${desa} yang bertanggung jawab atas penerapan dosis dan siklus budidaya padi di petak sawah Anda.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Gemma 2 9B dari Google, spesialis perhitungan teknis dan dosis presisi di Platform Padi Desa.
- Gaya komunikasi: Metodis, tertib, disiplin pada angka takaran (kg/ha, ml/liter, hari setelah tanam/HST). Berikan panduan yang eksak dan terukur.
- Ciri khas kalimat: Fokus pada rasio, takaran tepat, dan urutan kronologis yang jelas.
- Jika pengguna bertanya siapa dirinya: Berikan konfirmasi identitas yang presisi dan ringkas sesuai data sistem.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai Gemma 2 9B dari Google.`
    },

    'mixtral-8x7b': {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        provider: 'Mistral AI (via Groq)',
        apiType: 'groq',
        groqModel: 'mixtral-8x7b-32768',
        description: 'Arsitektur MoE handal untuk beragam solusi pertanian',
        badge: 'Seimbang',
        icon: '🌪️',
        personaTitle: 'Strategist Multidimensi & Kolaborasi Komunal Desa',
        tone: 'Seimbang, mempertimbangkan beberapa alternatif (kelebihan & kekurangan), mengedepankan gotong royong dan efisiensi bersama.',
        greeting: 'Halo! Saya Mixtral 8x7B dari Mistral AI. Dengan arsitektur Mixture-of-Experts, mari kita cari solusi terbaik dari berbagai sudut pandang.',
        selfIntroduction: 'Saya Mixtral 8x7B dari Mistral AI dengan arsitektur Mixture of Experts. Di Platform Padi Desa, saya membantu Anda menimbang berbagai solusi pertanian dari sudut pandang teknis sawah, ekonomi tani, hingga kebersamaan warga desa.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Dalam struktur kerja Platform Padi Desa, Anda adalah ${name} sebagai Administrator. Anda berperan menjembatani koordinasi teknis, manajemen akun, serta keterpaduan data seluruh pelaku pertanian.`;
            } else if (role === 'KEPALA_DESA') {
                return `Dalam tata kelola wilayah, Anda adalah ${name} sebagai Kepala Desa di ${desa}. Peran Anda memadukan kebutuhan kelompok tani, ketahanan pangan, dan kebijakan desa secara seimbang.`;
            } else {
                return `Dalam ekosistem pertanian, Anda adalah ${name} sebagai Petani di ${desa}. Anda berperan mengelola sawah sekaligus berkolaborasi dengan kelompok tani demi panen yang sejahtera.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah Mixtral 8x7B dari Mistral AI (Mixture of Experts) di Platform Padi Desa.
- Gaya komunikasi: Kolaboratif, komprehensif, senang memberikan perbandingan opsi (opsi A vs opsi B dengan kelebihan & pertimbangannya), memprioritaskan keselarasan kelompok tani.
- Ciri khas kalimat: Memberikan perspektif berimbang dan mendorong kerja sama kelompok tani.
- Jika pengguna bertanya siapa dirinya: Jelaskan perannya dalam keterhubungannya dengan pihak lain di desa secara harmonis.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai Mixtral 8x7B dari Mistral AI.`
    },

    'gpt-oss-120b': {
        id: 'gpt-oss-120b',
        name: 'GPT OSS 120B',
        provider: 'Open Source (via Groq)',
        apiType: 'groq',
        groqModel: 'openai/gpt-oss-120b',
        description: 'Model berkapasitas besar untuk penalaran komprehensif',
        badge: 'Komprehensif',
        icon: '🧠',
        personaTitle: 'Ensiklopedia Ketahanan Pangan Holistik',
        tone: 'Komprehensif dari hulu ke hilir (siklus lengkap bibit hingga pascapanen & distribusi pasar), berwawasan luas dan matang.',
        greeting: 'Selamat datang. Saya GPT OSS 120B. Siap mengulas seluruh rantai siklus pertanian padi dari hulu hingga hilir secara tuntas.',
        selfIntroduction: 'Saya GPT OSS 120B, model berkapasitas besar di Platform Padi Desa. Saya menyajikan wawasan holistik dari hulu ke hilir seputar budidaya padi, tata kelola agribisnis, hingga penguatan ketahanan pangan desa.',
        identityIntro: (name, role, desa) => {
            if (role === 'ADMIN') {
                return `Anda adalah ${name}, memangku jabatan Administrator Platform Padi Desa. Mandat ini mencakup tata kelola ekosistem digital pertanian secara makro, menyelaraskan informasi pengguna, lahan, serta hasil panen desa.`;
            } else if (role === 'KEPALA_DESA') {
                return `Anda adalah ${name}, memimpin sebagai Kepala Desa di ${desa}. Anda bertanggung jawab memajukan ketahanan pangan desa dari hulu ke hilir demi kemakmuran warga.`;
            } else {
                return `Anda adalah ${name}, Petani di ${desa}. Anda menggerakkan rantai produksi pangan utama dari penyiapan lahan, perawatan, hingga panen yang menopang ketahanan pangan.`;
            }
        },
        systemPersonaDirective: `KARAKTER KHAS ANDA:
- Anda adalah GPT OSS 120B di Platform Padi Desa, model berskala besar dengan pemahaman menyeluruh.
- Gaya komunikasi: Menyeluruh (holistik), melihat keterkaitan dari persiapan tanah, pemupukan, hingga pascapanen dan nilai jual.
- Ciri khas kalimat: Menghubungkan praktik di pematang sawah dengan dampak ketahanan pangan secara lebih luas.
- Jika pengguna bertanya siapa dirinya: Jawab secara komprehensif dengan menempatkan perannya dalam siklus besar pangan desa.
- Jika pengguna bertanya tentang siapa Anda: Perkenalkan diri Anda sebagai GPT OSS 120B.`
    }
};

const DEFAULT_MODEL_ID = 'llama-3.3-70b';

class AIService {
    getAvailableModels() {
        return Object.values(AI_MODELS).map(m => ({
            id: m.id,
            name: m.name,
            provider: m.provider,
            apiType: m.apiType,
            description: m.description,
            badge: m.badge,
            icon: m.icon,
            personaTitle: m.personaTitle,
            tone: m.tone
        }));
    }

    resolveModelConfig(requestedModel) {
        if (!requestedModel || typeof requestedModel !== 'string') {
            return AI_MODELS[DEFAULT_MODEL_ID];
        }

        const cleanKey = requestedModel.trim().toLowerCase();

        // Pencocokan langsung dengan key ID
        if (AI_MODELS[cleanKey]) {
            return AI_MODELS[cleanKey];
        }

        // Pencocokan alias atau partial
        if (cleanKey.includes('gemini-2') || cleanKey.includes('gemini 2')) {
            return AI_MODELS['gemini-2.0-flash'];
        }
        if (cleanKey.includes('gemini-pro') || cleanKey.includes('gemini 1.5 pro')) {
            return AI_MODELS['gemini-1.5-pro'];
        }
        if (cleanKey.includes('gemini')) {
            return AI_MODELS['gemini-1.5-flash'];
        }
        if (cleanKey.includes('70b') || cleanKey.includes('llama-3.3')) {
            return AI_MODELS['llama-3.3-70b'];
        }
        if (cleanKey.includes('8b') || cleanKey.includes('llama-3.1') || cleanKey.includes('instant')) {
            return AI_MODELS['llama-3.1-8b'];
        }
        if (cleanKey.includes('gemma')) {
            return AI_MODELS['gemma-2-9b'];
        }
        if (cleanKey.includes('mixtral') || cleanKey.includes('mistral')) {
            return AI_MODELS['mixtral-8x7b'];
        }
        if (cleanKey.includes('120b') || cleanKey.includes('gpt-oss')) {
            return AI_MODELS['gpt-oss-120b'];
        }

        return AI_MODELS[DEFAULT_MODEL_ID];
    }

    isUserIdentityQuestion(text) {
        if (!text) return false;
        const clean = text.toLowerCase()
            .replace(/[?!.,;:_'"~`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Jangan picu jika pengguna menanyakan identitas AI (kamu siapa, siapa kamu, dll)
        if (/\b(kamu\s+siapa|siapa\s+kamu|anda\s+siapa|siapa\s+anda|siapa\s+kau)\b/.test(clean)) {
            return false;
        }

        const patterns = [
            /\bsiapa\s+(saya|aku|diriku|diri\s*ku)\b/,
            /\b(saya|aku)\s+siapa\b/,
            /\bsiapakah\s+(saya|aku)\b/,
            /\b(kenal|tahu|tau)\s+(siapa\s+)?(saya|aku)\b/,
            /\b(siapa\s+nama\s+(saya|aku))\b/,
            /\b(nama\s+(saya|aku)\s+siapa)\b/,
            /\b(apa\s+peran\s+(saya|aku))\b/,
            /\b(peran\s+(saya|aku)\s+apa)\b/
        ];

        return patterns.some(pattern => pattern.test(clean));
    }

    isSelfIdentityQuestion(text) {
        if (!text) return false;
        const clean = text.toLowerCase()
            .replace(/[?!.,;:_'"~`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const patterns = [
            /\b(kamu\s+siapa|siapa\s+kamu|anda\s+siapa|siapa\s+anda|siapa\s+kau)\b/,
            /\b(kamu\s+model\s+apa|model\s+apa\s+kamu|versi\s+apa\s+kamu)\b/,
            /\b(kamu\s+dari\s+mana|siapa\s+pembuatmu|siapa\s+yang\s+buat\s+kamu)\b/,
            /\b(apa\s+tugasmu|kamu\s+bisa\s+apa|apa\s+keahlianmu)\b/
        ];

        return patterns.some(pattern => pattern.test(clean));
    }

    async getPlatformStats() {
        try {
            const [users, farmsCount] = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    role: true,
                    desa: true,
                    isActive: true
                }
            }).then(async (uList) => {
                const fCount = await prisma.farm.count().catch(() => 0);
                return [uList, fCount];
            });

            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.isActive).length;
            const inactiveUsers = totalUsers - activeUsers;
            const totalAdmin = users.filter(u => u.role === 'ADMIN').length;
            const totalKades = users.filter(u => u.role === 'KEPALA_DESA').length;
            const totalPetani = users.filter(u => u.role === 'PETANI').length;

            return {
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalAdmin,
                totalKades,
                totalPetani,
                totalFarms: farmsCount
            };
        } catch (err) {
            console.warn('⚠️ Gagal mengambil statistik platform di ai.service:', err.message);
            return {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                totalAdmin: 0,
                totalKades: 0,
                totalPetani: 0,
                totalFarms: 0
            };
        }
    }

    isUserCountQuestion(text) {
        if (!text) return false;
        const clean = text.toLowerCase()
            .replace(/[?!.,;:_'"~`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const normalized = clean
            .replace(/\bjumbla?h\b/g, 'jumlah')
            .replace(/\b(plafpom|pelatfrom|platfrom)\b/g, 'platform');

        const patterns = [
            /\b(ada\s+)?(berapa|jumlah|total)\s+(banyak\s+)?(pengguna|user|akun|orang|member|petani|kades|admin)\b/,
            /\b(pengguna|user|akun|orang|member)\s+(di\s+[\w\s]+\s+)?(ada\s+)?(berapa|jumlah|total)\b/,
            /\bberapa\s+(banyak\s+)?(yang\s+)?(terdaftar|aktif|ada)\b/,
            /\b(ada\s+berapa\s+pengguna)\b/,
            /\b(total|jumlah|banyaknya)\s+(seluruh\s+)?(pengguna|user|akun)\b/
        ];

        return patterns.some(pattern => pattern.test(normalized));
    }

    getUserCountResponse(stats, modelConfig) {
        const total = stats.totalUsers;
        const active = stats.activeUsers;
        const petani = stats.totalPetani;
        const kades = stats.totalKades;
        const admin = stats.totalAdmin;

        if (modelConfig.id === 'gemini-1.5-flash') {
            return `Data Real-Time Pengguna Platform Padi Desa:\n- Total: ${total} pengguna (${active} aktif)\n- Petani: ${petani} orang\n- Kepala Desa: ${kades} orang\n- Administrator: ${admin} orang\nData tersinkronisasi langsung dari database.`;
        }

        if (modelConfig.id === 'llama-3.1-8b') {
            return `Saat ini di platform kita tercatat ada ${total} pengguna (${active} akun yang aktif). Rinciannya:\n1. Petani: ${petani} orang\n2. Kepala Desa: ${kades} orang\n3. Admin: ${admin} orang.\nData ini langsung diambil dari sistem dan selalu update otomatis!`;
        }

        if (modelConfig.id === 'gemma-2-9b') {
            return `Metrik Basis Data Pengguna:\n- Total entri terdaftar: ${total} akun\n- Akun aktif: ${active} akun\n- Komposisi: Petani (${petani}), Kepala Desa (${kades}), Administrator (${admin})\nAngka di atas diverifikasi langsung dari basis data aktif secara real-time.`;
        }

        return `Berdasarkan sinkronisasi basis data Platform Padi Desa saat ini, tercatat total ${total} pengguna (${active} akun berstatus aktif).\n\n` +
            `Rincian berdasarkan peran:\n` +
            `1. Petani: ${petani} orang\n` +
            `2. Kepala Desa: ${kades} orang\n` +
            `3. Administrator: ${admin} orang\n\n` +
            `Data ini disinkronkan secara langsung dari database sistem.`;
    }

    async callGroq(groqModel, systemPrompt, question) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey.trim() === '' || apiKey.includes('xxxx')) {
            throw new Error('GROQ_API_KEY tidak dikonfigurasi di file .env');
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: groqModel || 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                max_tokens: 800,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('Respon Groq kosong');
        }
        return content;
    }

    async callGemini(geminiModel, systemPrompt, question) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.trim() === '' || apiKey.includes('xxxx')) {
            throw new Error('GEMINI_API_KEY tidak dikonfigurasi di file .env');
        }

        const model = geminiModel || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Coba dengan system_instruction
        try {
            const response = await axios.post(
                url,
                {
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [{
                        role: 'user',
                        parts: [{ text: question }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000,
                }
            );

            const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) return content;
        } catch (firstErr) {
            console.warn(`⚠️ Percobaan awal Gemini ${model} dengan system_instruction:`, firstErr.response?.data?.error?.message || firstErr.message);
        }

        // Fallback: Gabungkan systemPrompt langsung ke dalam konten user
        const fallbackResponse = await axios.post(
            url,
            {
                contents: [{
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\n---\n[INSTRUKSI]: Jawab pertanyaan pengguna berikut ini dengan baik sesuai gaya dan karakter khas Anda:\n${question}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            }
        );

        const content = fallbackResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            throw new Error('Respon Gemini kosong');
        }
        return content;
    }

    async chatWithAI(user, question, requestedModel = null) {
        let userObj = typeof user === 'object' && user !== null ? { ...user } : { id: user, role: 'PETANI' };

        // Selalu sinkronkan data profil terbaru langsung dari database
        try {
            let dbUser = null;
            if (userObj.id) {
                dbUser = await prisma.user.findUnique({
                    where: { id: userObj.id }
                });
            }
            if (!dbUser && userObj.email) {
                dbUser = await prisma.user.findUnique({
                    where: { email: userObj.email }
                });
            }
            if (dbUser) {
                userObj = { ...userObj, ...dbUser };
            }
        } catch (dbErr) {
            console.warn('⚠️ Gagal mengambil user DB di ai.service:', dbErr.message);
        }

        const role = (userObj.role || 'PETANI').toUpperCase();
        const defaultRoleName = role === 'ADMIN' ? 'Admin' : role === 'KEPALA_DESA' ? 'Kepala Desa' : 'Petani';
        const name = (userObj.name && userObj.name.trim() !== '') ? userObj.name.trim() : defaultRoleName;
        const desa = userObj.desa || (role === 'ADMIN' ? 'Pusat' : 'Desa Sukamakmur');

        // Tentukan konfigurasi model yang dipilih
        let modelConfig = this.resolveModelConfig(requestedModel);

        // Ambil data statistik sistem terkini secara real-time dari database
        const platformStats = await this.getPlatformStats();

        // Siapkan instruksi sistem berkarakter spesifik per model AI
        const systemPrompt = `Anda adalah AI Assistant resmi untuk "Platform Padi Desa", berjalan menggunakan model ${modelConfig.name} (${modelConfig.provider}).
Gelar Persona Anda: ${modelConfig.personaTitle}.
Nada Bicara / Tone: ${modelConfig.tone}

${modelConfig.systemPersonaDirective}

DATA REAL-TIME SISTEM PLATFORM PADI DESA SAAT INI (LANGSUNG DARI DATABASE):
- Total Pengguna Terdaftar: ${platformStats.totalUsers} pengguna (${platformStats.activeUsers} akun aktif, ${platformStats.inactiveUsers} akun nonaktif).
- Rincian Pengguna Berdasarkan Peran: ${platformStats.totalPetani} Petani, ${platformStats.totalKades} Kepala Desa, ${platformStats.totalAdmin} Administrator.
- Total Lahan Pertanian Terdaftar: ${platformStats.totalFarms} lahan sawah.
Jika pengguna menanyakan jumlah pengguna, jumlah petani, atau statistik sistem, sebutkan data angka pasti di atas menggunakan gaya bahasa khas model Anda!

PROFIL PENGGUNA YANG SEDANG ANDA AJAK BICARA:
- Nama Pengguna: ${name}
- Peran (Role): ${role} (${defaultRoleName})
- Wilayah / Desa: ${desa}

INSTRUKSI KHUSUS PERTANYAAN IDENTITAS PENGGUNA:
Jika pengguna menanyakan identitasnya (seperti "siapa saya", "saya siapa", "siapa aku", "kamu kenal saya", "siapa nama saya", "apa peran saya"):
Jawab siapa dirinya berdasarkan profil di atas DENGAN GAYA BAHASA, TONE, DAN CIRI KHAS MODEL ANDA SENDIRI!
Referensi gaya jawaban Anda:
"${modelConfig.identityIntro(name, role, desa)}"
(Kembangkan dan sampaikan dengan gaya khas Anda secara alami!)

INSTRUKSI KHUSUS PERTANYAAN IDENTITAS AI / MODEL:
Jika pengguna bertanya tentang siapa Anda (seperti "kamu siapa", "siapa kamu", "siapa anda", "kamu model apa", "versi apa"):
Jawab dengan percaya diri memperkenalkan nama Anda sebagai ${modelConfig.name} (${modelConfig.provider}), gelar Anda sebagai ${modelConfig.personaTitle}, dan jelaskan keunggulan versi Anda di Platform Padi Desa!

ATURAN KETAT PANGGILAN PENGGUNA (MUTLAK):
- DILARANG KERAS menggunakan kata "Bapak", "Ibu", "Bapak/Ibu", "Pak", atau "Bu" dalam salam pembuka, sapaan, maupun seluruh jawaban!
- Cukup gunakan kata "Anda" atau sebut perannya: "Admin", "Kepala Desa", atau "Petani", atau langsung panggil nama "${name}".

ATURAN FORMAT PENULISAN (SANGAT PENTING):
- DILARANG MENGGUNAKAN tanda bintang (* atau **), garis pemisah (---, ___), header markdown (##, ###), atau garis tabel (|).
- Tulis jawaban menggunakan teks biasa yang rapi dan mudah dibaca (gunakan penomoran biasa 1., 2., 3. atau tanda minus/strip - biasa).
- JANGAN PERNAH meminta maaf atau menggunakan kata "maaf" dalam kondisi apa pun.

TEMA UTAMA:
1. Pertanian padi (budidaya, bibit, pemupukan berimbang, irigasi, hama & penyakit wereng/penggerek/blas, panen, pascapanen).
2. Manajemen lahan, statistik sistem, serta fitur-fitur aplikasi Platform Padi Desa.
3. Jika pengguna bertanya di luar tema (game, hiburan, kode programming umum), tolak secara santun dengan gaya khas model Anda dan arahkan kembali ke pertanian padi.`;

        let rawAnswer = null;
        let modelUsed = modelConfig;

        // Coba panggil provider utama sesuai model
        try {
            if (modelConfig.apiType === 'gemini') {
                rawAnswer = await this.callGemini(modelConfig.geminiModel, systemPrompt, question);
            } else {
                rawAnswer = await this.callGroq(modelConfig.groqModel, systemPrompt, question);
            }
        } catch (primaryError) {
            console.warn(`⚠️ Model utama ${modelConfig.name} gagal (${primaryError.message}), mencoba model alternatif...`);

            // Upaya fallback otomatis antar provider
            try {
                if (modelConfig.apiType === 'gemini' && process.env.GROQ_API_KEY) {
                    modelUsed = AI_MODELS['llama-3.3-70b'] || AI_MODELS['gpt-oss-120b'];
                    rawAnswer = await this.callGroq(modelUsed.groqModel, systemPrompt, question);
                } else if (modelConfig.apiType === 'groq' && process.env.GEMINI_API_KEY) {
                    modelUsed = AI_MODELS['gemini-1.5-flash'];
                    rawAnswer = await this.callGemini(modelUsed.geminiModel, systemPrompt, question);
                } else if (modelConfig.apiType === 'groq') {
                    const fallbackKey = modelConfig.id === 'llama-3.3-70b' ? 'llama-3.1-8b' : 'llama-3.3-70b';
                    modelUsed = AI_MODELS[fallbackKey] || modelConfig;
                    rawAnswer = await this.callGroq(modelUsed.groqModel, systemPrompt, question);
                }
            } catch (fallbackError) {
                console.warn('⚠️ Fallback model alternatif juga gagal:', fallbackError.message);
            }
        }

        if (!rawAnswer) {
            return await this.getSmartResponse(question, { ...userObj, name, role, desa }, platformStats, modelConfig);
        }

        return {
            success: true,
            data: {
                question,
                answer: this.cleanAnswer(rawAnswer),
                model: modelUsed.id,
                modelName: modelUsed.name,
                provider: modelUsed.provider,
                icon: modelUsed.icon,
                isDummy: false
            }
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
        cleaned = cleaned.replace(/^[\s]*\|.*\|[\s]*$/gm, function(line) {
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

        // Rapikan huruf kapital di awal kalimat jika kata maaf di awal dihapus
        cleaned = cleaned.replace(/^([a-z])/g, (c) => c.toUpperCase());
        cleaned = cleaned.replace(/^(🌾\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

        // Hapus sapaan Bapak/Ibu/Pak/Bu yang tidak diinginkan
        cleaned = cleaned.replace(/\b(Bapak\/Ibu|Bapak|Ibu)\s+(Admin|Kepala\s+Desa|Petani)\b/gi, '$2');
        cleaned = cleaned.replace(/\b(Pak\s+Tani|Bu\s+Tani)\b/gi, 'Petani');
        cleaned = cleaned.replace(/^(\s*🌾\s*)?(Halo\s+|Hai\s+)?(Bapak\/Ibu|Bapak|Ibu|Pak|Bu)[,.\s-]+/i, '$1$2');
        cleaned = cleaned.replace(/\b(Bapak\/Ibu|Bapak|Ibu)\b/gi, 'Anda');
        cleaned = cleaned.replace(/\bAnda\s+Anda\b/gi, 'Anda');

        // Rapikan baris kosong berturut-turut yang berlebihan
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        return cleaned.trim();
    }

    async getSmartResponse(question, user, stats = null, modelConfig = null) {
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
            console.warn('⚠️ Gagal mengambil user DB di getSmartResponse:', dbErr.message);
        }

        const role = (userObj.role || 'PETANI').toUpperCase();
        const defaultRoleName = role === 'ADMIN' ? 'Admin' : role === 'KEPALA_DESA' ? 'Kepala Desa' : 'Petani';
        const name = (userObj.name && userObj.name.trim() !== '') ? userObj.name.trim() : defaultRoleName;
        const desa = userObj.desa || (role === 'ADMIN' ? 'Pusat' : 'Desa Sukamakmur');

        const activeModel = modelConfig || AI_MODELS[DEFAULT_MODEL_ID];

        // Jika pertanyaan seputar identitas diri pengguna
        if (this.isUserIdentityQuestion(question)) {
            const answer = typeof activeModel.identityIntro === 'function'
                ? activeModel.identityIntro(name, role, desa)
                : `Anda adalah ${name} sebagai ${defaultRoleName} di Platform Padi Desa.`;

            return {
                success: true,
                data: {
                    question,
                    answer,
                    model: activeModel.id,
                    modelName: activeModel.name,
                    provider: activeModel.provider,
                    icon: activeModel.icon,
                    isDummy: false
                }
            };
        }

        // Jika pertanyaan seputar siapa AI
        if (this.isSelfIdentityQuestion(question)) {
            const answer = activeModel.selfIntroduction || `Saya adalah ${activeModel.name} dari ${activeModel.provider}, AI Assistant di Platform Padi Desa.`;
            return {
                success: true,
                data: {
                    question,
                    answer,
                    model: activeModel.id,
                    modelName: activeModel.name,
                    provider: activeModel.provider,
                    icon: activeModel.icon,
                    isDummy: false
                }
            };
        }

        // Jika pertanyaan seputar jumlah pengguna
        if (this.isUserCountQuestion(question)) {
            const platformStats = stats || await this.getPlatformStats();
            return {
                success: true,
                data: {
                    question,
                    answer: this.getUserCountResponse(platformStats, activeModel),
                    model: activeModel.id,
                    modelName: activeModel.name,
                    provider: activeModel.provider,
                    icon: activeModel.icon,
                    isDummy: false
                }
            };
        }

        return {
            success: true,
            data: {
                question,
                answer: `🌾 Layanan AI ${activeModel.name} (${activeModel.personaTitle}) sedang tidak terhubung atau batas kuota API tercapai. Saya siap membantu pertanyaan seputar budidaya padi, pemupukan berimbang, dan manajemen lahan sawah di Platform Padi Desa.`,
                model: activeModel.id,
                modelName: activeModel.name,
                provider: activeModel.provider,
                icon: activeModel.icon,
                isDummy: true
            }
        };
    }

    async getHistory(userId) {
        return { success: true, data: [] };
    }

    getConfig() {
        const groq = process.env.GROQ_API_KEY || '';
        const gemini = process.env.GEMINI_API_KEY || '';

        return {
            groqApiKey: groq,
            geminiApiKey: gemini,
            groqConfigured: !!(groq.trim() && !groq.includes('xxxx')),
            geminiConfigured: !!(gemini.trim() && !gemini.includes('xxxx')),
            defaultModel: DEFAULT_MODEL_ID,
            models: this.getAvailableModels()
        };
    }

    getEnvFilePath() {
        const fs = require('fs');
        const path = require('path');
        const candidates = [
            path.resolve(__dirname, '../../../../backend/.env'),
            path.resolve(__dirname, '../../../.env'),
            path.resolve(process.cwd(), 'backend/.env'),
            path.resolve(process.cwd(), '.env')
        ];
        for (const p of candidates) {
            if (fs.existsSync(p)) return p;
        }
        return path.resolve(process.cwd(), 'backend/.env');
    }

    saveKeysToEnvFile(groqKey, geminiKey) {
        const fs = require('fs');
        const envPath = this.getEnvFilePath();
        let content = '';
        if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, 'utf8');
        }

        if (groqKey !== undefined) {
            const cleanGroq = typeof groqKey === 'string' ? groqKey.trim() : '';
            if (/^GROQ_API_KEY=.*$/m.test(content)) {
                content = content.replace(/^GROQ_API_KEY=.*$/m, `GROQ_API_KEY="${cleanGroq}"`);
            } else {
                content += `\nGROQ_API_KEY="${cleanGroq}"`;
            }
            process.env.GROQ_API_KEY = cleanGroq;
        }

        if (geminiKey !== undefined) {
            const cleanGemini = typeof geminiKey === 'string' ? geminiKey.trim() : '';
            if (/^GEMINI_API_KEY=.*$/m.test(content)) {
                content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY="${cleanGemini}"`);
            } else {
                content += `\nGEMINI_API_KEY="${cleanGemini}"`;
            }
            process.env.GEMINI_API_KEY = cleanGemini;
        }

        fs.writeFileSync(envPath, content, 'utf8');
        console.log(`✅ [AI Config] File .env diperbarui di ${envPath}`);
        return true;
    }

    async updateConfig({ groqApiKey, geminiApiKey, defaultModel }) {
        if (groqApiKey !== undefined || geminiApiKey !== undefined) {
            this.saveKeysToEnvFile(groqApiKey, geminiApiKey);
        }

        return {
            success: true,
            message: 'Konfigurasi API Key AI berhasil disimpan dan langsung aktif!',
            data: this.getConfig()
        };
    }

    async testKeys(groqKey = null, geminiKey = null) {
        const testGroq = (groqKey !== null && groqKey !== undefined)
            ? groqKey.trim()
            : (process.env.GROQ_API_KEY || '').trim();

        const testGemini = (geminiKey !== null && geminiKey !== undefined)
            ? geminiKey.trim()
            : (process.env.GEMINI_API_KEY || '').trim();

        const results = {
            groq: { success: false, message: '' },
            gemini: { success: false, message: '' }
        };

        // Test Groq
        if (!testGroq || testGroq.includes('xxxx')) {
            results.groq = { success: false, message: 'GROQ_API_KEY belum diisi.' };
        } else {
            try {
                const resp = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: 'llama-3.1-8b-instant',
                        messages: [{ role: 'user', content: 'ping' }],
                        max_tokens: 5
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${testGroq}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                );
                if (resp.data?.choices?.[0]?.message?.content) {
                    results.groq = { success: true, message: 'Koneksi Groq API Berhasil! Model Meta Llama, Gemma, Mixtral siap digunakan.' };
                } else {
                    results.groq = { success: false, message: 'Respon Groq API tidak valid.' };
                }
            } catch (err) {
                results.groq = { success: false, message: err.response?.data?.error?.message || err.message };
            }
        }

        // Test Gemini
        if (!testGemini || testGemini.includes('xxxx')) {
            results.gemini = { success: false, message: 'GEMINI_API_KEY belum diisi.' };
        } else {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testGemini}`;
                const resp = await axios.post(
                    url,
                    {
                        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
                        generationConfig: { maxOutputTokens: 5 }
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );
                if (resp.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    results.gemini = { success: true, message: 'Koneksi Google Gemini API Berhasil! Model Gemini & AI Vision siap digunakan.' };
                } else {
                    results.gemini = { success: false, message: 'Respon Gemini API tidak valid.' };
                }
            } catch (err) {
                results.gemini = { success: false, message: err.response?.data?.error?.message || err.message };
            }
        }

        return results;
    }
}

module.exports = new AIService();
