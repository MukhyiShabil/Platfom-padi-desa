const aiService = require('./ai.service');
const aiVisionService = require('./ai-vision.service');

class AIController {
    getAvailableModels(req, res) {
        try {
            const models = aiService.getAvailableModels();
            res.json({
                success: true,
                data: models
            });
        } catch (error) {
            console.error('AI Controller getAvailableModels error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async chat(req, res) {
        try {
            const { question, model } = req.body;
            const user = req.user;

            if (!question) {
                return res.status(400).json({
                    success: false,
                    message: 'Pertanyaan wajib diisi'
                });
            }

            const result = await aiService.chatWithAI(user, question, model);
            res.json(result);
        } catch (error) {
            console.error('AI Controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async analyzeImage(req, res) {
        try {
            const file = req.file;
            const question = req.body.question || '';
            const model = req.body.model;
            const user = req.user;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'File gambar wajib diupload'
                });
            }

            const result = await aiVisionService.analyzeImage(
                file.buffer,
                file.mimetype,
                question,
                user,
                model
            );

            res.json(result);
        } catch (error) {
            console.error('AI Vision Controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getHistory(req, res) {
        res.json({ success: true, data: [] });
    }
}

module.exports = new AIController();
