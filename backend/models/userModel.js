// Importa o pool de conexões com o banco de dados (PostgreSQL)
const pool = require('../db');
const PasswordUtils = require('../utils/passwordUtils');

const UserModel = {
    
    // Cria um novo usuário no banco de dados
    create: async (nome, email, senha) => {
        // Criptografa a senha antes de salvar no banco
        const hashedPassword = await PasswordUtils.hashPassword(senha);
        
        const newUser = await pool.query(
            `INSERT INTO usuarios (nome, email, senha) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nome, email, hashedPassword] // Parâmetros da query (para evitar SQL Injection)
        );
        return newUser.rows[0]; // Retorna o usuário criado
    },

    // Busca um usuário pelo email
    findUserByEmail: async (email) => {
        const user = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return user.rows[0]; // Retorna o usuário encontrado ou undefined
    },

    // Verifica se a senha fornecida corresponde ao hash armazenado
    verifyPassword: async (senha, hashedPassword) => {
        return await PasswordUtils.comparePassword(senha, hashedPassword);
    }
};

// Exporta o modelo para ser usado nos controllers
module.exports = UserModel;
