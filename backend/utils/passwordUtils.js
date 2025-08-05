const bcrypt = require('bcrypt');

// Configuração do salt rounds (número de iterações para gerar o hash)
const SALT_ROUNDS = 10;

const PasswordUtils = {
    // Criptografa uma senha usando bcrypt
    hashPassword: async (password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            return hashedPassword;
        } catch (error) {
            console.error('Erro ao criptografar senha:', error);
            throw new Error('Erro ao criptografar senha');
        }
    },

    // Verifica se uma senha corresponde ao hash armazenado
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