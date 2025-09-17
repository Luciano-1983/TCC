/**
 * MODELO DE USUÁRIOS COMUNS
 * 
 * Este arquivo contém todas as funções que fazem operações diretas no banco de dados
 * relacionadas aos usuários comuns (famílias que buscam cuidadores).
 * 
 * Cada função representa uma operação diferente no banco:
 * - create: Cria um novo usuário
 * - findUserByEmail: Busca usuário pelo email
 * - verifyPassword: Verifica se a senha está correta
 */

// Importação dos módulos necessários
const { DatabaseManager } = require('../config/database');  // Gerenciador do banco de dados
const PasswordUtils = require('../utils/passwordUtils');     // Utilitário para criptografia de senhas

const UserModel = {
    
    /**
     * CRIAR NOVO USUÁRIO NO BANCO DE DADOS
     * 
     * Esta função recebe os dados de um usuário e os salva no banco de dados.
     * A senha é criptografada antes de ser salva por segurança.
     * 
     * Parâmetros:
     * - nome: Nome completo do usuário
     * - email: Email para login
     * - senha: Senha em texto puro (será criptografada)
     * 
     * Retorna: Dados do usuário criado (sem a senha criptografada)
     */
    create: async (nome, email, senha) => {
        // Criptografa a senha antes de salvar no banco
        const hashedPassword = await PasswordUtils.hashPassword(senha);
        
        // Executa a consulta SQL para inserir o usuário
        const newUser = await DatabaseManager.query(
            `INSERT INTO usuarios (nome, email, senha) 
             VALUES ($1, $2, $3) RETURNING *`,
            [nome, email, hashedPassword]
        );
        
        // Retorna apenas os dados do usuário (primeira linha do resultado)
        return newUser.rows[0];
    },

    /**
     * BUSCAR USUÁRIO PELO EMAIL
     * 
     * Esta função busca um usuário específico pelo seu email.
     * É usada principalmente no processo de login.
     * 
     * Parâmetros:
     * - email: Email do usuário a ser buscado
     * 
     * Retorna: Dados do usuário (se encontrado) ou undefined (se não encontrado)
     */
    findUserByEmail: async (email) => {
        // Executa consulta SQL para buscar pelo email
        const user = await DatabaseManager.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        
        // Retorna o primeiro resultado (ou undefined se não encontrou)
        return user.rows[0];
    },

    /**
     * VERIFICAR SE A SENHA ESTÁ CORRETA
     * 
     * Esta função compara a senha digitada pelo usuário com a senha criptografada
     * armazenada no banco de dados.
     * 
     * Parâmetros:
     * - senha: Senha em texto puro digitada pelo usuário
     * - hashedPassword: Senha criptografada armazenada no banco
     * 
     * Retorna: true (se a senha estiver correta) ou false (se estiver incorreta)
     */
    verifyPassword: async (senha, hashedPassword) => {
        return await PasswordUtils.comparePassword(senha, hashedPassword);
    }
};

module.exports = UserModel;
