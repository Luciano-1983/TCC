const { DatabaseManager } = require('../config/database');
const PasswordUtils = require('../utils/passwordUtils');

const ProfessionalModel = {

    createProfessional: async (nome, telefone, email, cidade, especialidade, registro, senha) => {
        const hashedPassword = await PasswordUtils.hashPassword(senha);
        
        const newProfessional = await DatabaseManager.query(
            `INSERT INTO profissionais 
            (nome, telefone, email, cidade, especialidade, registro, senha) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nome, telefone, email, cidade, especialidade, registro, hashedPassword]
        );
        return newProfessional.rows[0];
    },

    findProfessionalByEmail: async (email) => {
        const professional = await DatabaseManager.query(
            'SELECT * FROM profissionais WHERE email = $1',
            [email]
        );
        return professional.rows[0];
    },

    verifyPassword: async (senha, hashedPassword) => {
        return await PasswordUtils.comparePassword(senha, hashedPassword);
    },

    findAll: async () => {
        const { rows } = await DatabaseManager.query('SELECT * FROM profissionais');
        return rows;
    },

    findById: async (id) => {
        const { rows } = await DatabaseManager.query('SELECT * FROM profissionais WHERE id = $1', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const { nome, telefone, email, cidade, especialidade, registro, senha } = data;

        let hashedPassword = senha;
        if (senha) {
            hashedPassword = await PasswordUtils.hashPassword(senha);
        }

        const result = await DatabaseManager.query(
            `UPDATE profissionais SET 
            nome = $1, telefone = $2, email = $3, cidade = $4, 
            especialidade = $5, registro = $6, senha = $7 
            WHERE id = $8 RETURNING *`,
            [nome, telefone, email, cidade, especialidade, registro, hashedPassword, id]
        );

        return result.rows[0];
    },

    delete: async (id) => {
        try {
            const result = await DatabaseManager.query(
                'DELETE FROM profissionais WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao excluir profissional no modelo:', error);
            throw error;
        }
    },
};

module.exports = ProfessionalModel;
