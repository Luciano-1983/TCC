// Importa o modelo que contém a lógica de acesso ao banco de dados para os profissionais de saúde
const ProfessionalModel = require('../models/professionalModel');

// Define o controlador com os métodos de manipulação dos dados dos profissionais
const ProfessionalController = {
    
    // Método para registrar um novo profissional
    register: async (req, res) => {
        const { nome, telefone, email, cidade, especialidade, registro, senha } = req.body;

        try {
            // Chama o método do model para criar um novo profissional
            const professional = await ProfessionalModel.createProfessional(
                nome, telefone, email, cidade, especialidade, registro, senha
            );

            // Retorna os dados do profissional criado em formato JSON
            res.json(professional);
        } catch (err) {
            // Caso ocorra erro, exibe no console e retorna erro 500
            console.error(err.message);
            res.status(500).send('Erro ao registrar profissional');
        }
    },

    // Método para login do profissional
    login: async (req, res) => {
        const { email, senha } = req.body;

        try {
            // Busca profissional por email
            const professional = await ProfessionalModel.findProfessionalByEmail(email);

            if (professional) {
                // Verifica se a senha fornecida corresponde ao hash armazenado
                const isPasswordValid = await ProfessionalModel.verifyPassword(senha, professional.senha);
                
                if (isPasswordValid) {
                    // Se a senha estiver correta, retorna os dados do profissional
                    res.json(professional);
                } else {
                    // Se a senha estiver incorreta, retorna erro 401
                    res.status(401).send('Credenciais inválidas');
                }
            } else {
                // Se o profissional não for encontrado, retorna erro 401
                res.status(401).send('Credenciais inválidas');
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao fazer login');
        }
    },

    // Método para buscar todos os profissionais cadastrados
    getAll: async (req, res) => {
        try {
            const profissionais = await ProfessionalModel.findAll(); // Consulta no banco
            res.json(profissionais); // Retorna a lista
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            res.status(500).send('Erro ao buscar profissionais');
        }
    },

    // Método para buscar um profissional específico por ID
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

    // Método para atualizar os dados de um profissional
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
        res.status(500).json({ message: 'Erro ao atualizar profissional', error: error.message });
    }
},

    // Método para excluir um profissional pelo ID
    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const result = await ProfessionalModel.delete(id);

            // Se não encontrou o profissional, retorna 404
            if (!result) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }

            // Sucesso sem conteúdo (204 = No Content)
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            res.status(500).json({ message: 'Erro ao excluir profissional' });
        }
    },

};

// Exporta o controlador para ser usado nas rotas
module.exports = ProfessionalController;
