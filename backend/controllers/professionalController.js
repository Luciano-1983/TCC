const ProfessionalModel = require('../models/professionalModel');

const ProfessionalController = {
    
    register: async (req, res) => {
        const { nome, telefone, email, cidade, especialidade, registro, senha } = req.body;

        try {
            const professional = await ProfessionalModel.createProfessional(
                nome, telefone, email, cidade, especialidade, registro, senha
            );

            res.json(professional);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao registrar profissional');
        }
    },

    login: async (req, res) => {
        const { email, senha } = req.body;

        try {
            const professional = await ProfessionalModel.findProfessionalByEmail(email);

            if (professional) {
                const isPasswordValid = await ProfessionalModel.verifyPassword(senha, professional.senha);
                
                if (isPasswordValid) {
                    res.json(professional);
                } else {
                    res.status(401).send('Credenciais inválidas');
                }
            } else {
                res.status(401).send('Credenciais inválidas');
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao fazer login');
        }
    },

    getAll: async (req, res) => {
        try {
            const profissionais = await ProfessionalModel.findAll();
            res.json(profissionais);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            res.status(500).send('Erro ao buscar profissionais');
        }
    },

    getById: async (req, res) => {
        const { id } = req.params;

        try {
            const profissional = await ProfessionalModel.findById(id);
            if (!profissional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            res.json(profissional);
        } catch (error) {
            console.error('Erro ao buscar profissional:', error);
            res.status(500).json({ message: 'Erro ao buscar profissional' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const updatedData = req.body;

        if (!id || !updatedData) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const requiredFields = ['nome', 'email', 'senha', 'telefone', 'cidade', 'especialidade'];
        for (const field of requiredFields) {
            if (!updatedData[field]) {
                return res.status(400).json({ message: `Campo obrigatório faltando: ${field}` });
            }
        }

        try {
            const updatedProfessional = await ProfessionalModel.update(id, updatedData);
            if (!updatedProfessional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            res.json(updatedProfessional);
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            res.status(500).json({ message: 'Erro ao atualizar profissional' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const deleted = await ProfessionalModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            res.json({ message: 'Profissional removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover profissional:', error);
            res.status(500).json({ message: 'Erro ao remover profissional' });
        }
    }
};

module.exports = ProfessionalController;
