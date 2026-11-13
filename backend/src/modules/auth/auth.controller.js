const authService = require('./auth.service');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password wajib diisi'
                });
            }

            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async register(req, res) {
        try {
            const { email, password, name, role, desa, notificationEmail } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama, email, dan password wajib diisi'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password minimal 6 karakter'
                });
            }

            const result = await authService.register({
                email,
                password,
                name,
                role,
                desa,
                notificationEmail
            });

            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Gagal melakukan pendaftaran akun'
            });
        }
    }

    async refreshToken(req, res) {
        try {
            let token = req.body?.token;
            if (!token && req.headers.authorization?.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            }
            if (!token && req.body?.email) {
                token = req.body.email;
            }
            if (!token && req.cookies?.accessToken) {
                token = req.cookies.accessToken;
            }

            const result = await authService.refreshToken(token);
            res.json(result);
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Gagal memperbarui token'
            });
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await authService.getCurrentUser(req.user.id);
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();