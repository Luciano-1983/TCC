const { DatabaseManager } = require('../config/database');
const PasswordUtils = require('../utils/passwordUtils');

const UserModel = {
    
    create: async (nome, email, senha) => {
        const hashedPassword = await PasswordUtils.hashPassword(senha);
        
        const newUser = await DatabaseManager.query(
            `INSERT INTO usuarios (nome, email, senha) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nome, email, hashedPassword]
        );
        return newUser.rows[0];
    },

    findUserByEmail: async (email) => {
        const user = await DatabaseManager.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return user.rows[0];
    },

    verifyPassword: async (senha, hashedPassword) => {
        return await PasswordUtils.comparePassword(senha, hashedPassword);
    }
};

module.exports = UserModel;
