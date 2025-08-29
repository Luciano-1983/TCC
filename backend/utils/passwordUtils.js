const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const PasswordUtils = {
    hashPassword: async (password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            return hashedPassword;
        } catch (error) {
            console.error('Erro ao criptografar senha:', error);
            throw new Error('Erro ao criptografar senha');
        }
    },

    comparePassword: async (password, hashedPassword) => {
        try {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            throw new Error('Erro ao verificar senha');
        }
    }
};

module.exports = PasswordUtils; 