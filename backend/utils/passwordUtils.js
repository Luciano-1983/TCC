/**
 * UTILITÁRIOS PARA CRIPTOGRAFIA DE SENHAS
 * 
 * Este arquivo é responsável por criptografar e verificar senhas.
 * É uma questão de SEGURANÇA muito importante!
 * 
 * O que este arquivo faz:
 * - Criptografa senhas antes de salvar no banco de dados
 * - Verifica se a senha digitada está correta
 * - Usa a biblioteca bcrypt para segurança máxima
 * 
 * IMPORTANTE: Senhas NUNCA são salvas em texto puro no banco!
 * Elas são sempre criptografadas para proteger os usuários.
 */

// Importa a biblioteca bcrypt para criptografia de senhas
const bcrypt = require('bcrypt');

// Número de "rodadas" de criptografia (quanto maior, mais seguro)
const SALT_ROUNDS = 10;

const PasswordUtils = {
    /**
     * CRIPTOGRAFA UMA SENHA
     * 
     * Esta função pega uma senha em texto puro e a transforma
     * em uma versão criptografada que pode ser salva no banco.
     * 
     * Parâmetros:
     * - password: Senha em texto puro (ex: "123456")
     * 
     * Retorna: Senha criptografada (ex: "$2b$10$abc123...")
     */
    hashPassword: async (password) => {
        try {
            // Criptografa a senha usando bcrypt
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            return hashedPassword;
        } catch (error) {
            console.error('Erro ao criptografar senha:', error);
            throw new Error('Erro ao criptografar senha');
        }
    },

    /**
     * VERIFICA SE UMA SENHA ESTÁ CORRETA
     * 
     * Esta função compara uma senha digitada pelo usuário
     * com a senha criptografada salva no banco.
     * 
     * Parâmetros:
     * - password: Senha digitada pelo usuário (texto puro)
     * - hashedPassword: Senha criptografada do banco
     * 
     * Retorna: true (se a senha estiver correta) ou false (se estiver incorreta)
     */
    comparePassword: async (password, hashedPassword) => {
        try {
            // Compara a senha digitada com a senha criptografada
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            throw new Error('Erro ao verificar senha');
        }
    }
};

module.exports = PasswordUtils; 