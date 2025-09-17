/**
 * MODELO DE PROFISSIONAIS DE SAÚDE
 * 
 * Este arquivo contém todas as funções que fazem operações diretas no banco de dados
 * relacionadas aos profissionais de saúde (cuidadores, enfermeiros, técnicos).
 * 
 * Cada função representa uma operação diferente no banco:
 * - createProfessional: Cria um novo profissional
 * - findProfessionalByEmail: Busca profissional pelo email
 * - verifyPassword: Verifica se a senha está correta
 * - findAll: Lista todos os profissionais
 * - findById: Busca profissional pelo ID
 * - update: Atualiza dados de um profissional
 * - delete: Remove um profissional
 */

// Importação dos módulos necessários
const { DatabaseManager } = require('../config/database');  // Gerenciador do banco de dados
const PasswordUtils = require('../utils/passwordUtils');     // Utilitário para criptografia de senhas

const ProfessionalModel = {

    /**
     * CRIAR NOVO PROFISSIONAL NO BANCO DE DADOS
     * 
     * Esta função recebe os dados de um profissional e os salva no banco de dados.
     * A senha é criptografada antes de ser salva por segurança.
     * 
     * Parâmetros:
     * - nome: Nome completo do profissional
     * - telefone: Telefone para contato
     * - email: Email para login
     * - cidade: Cidade onde atende
     * - especialidade: Tipo de profissional
     * - registro: Número do registro profissional (pode ser null para cuidadores)
     * - senha: Senha em texto puro (será criptografada)
     * 
     * Retorna: Dados do profissional criado (sem a senha criptografada)
     */
    createProfessional: async (nome, telefone, email, cidade, especialidade, registro, senha) => {
        // Criptografa a senha antes de salvar no banco
        const hashedPassword = await PasswordUtils.hashPassword(senha);
        
        // Executa a consulta SQL para inserir o profissional
        const newProfessional = await DatabaseManager.query(
            `INSERT INTO profissionais 
            (nome, telefone, email, cidade, especialidade, registro, senha) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nome, telefone, email, cidade, especialidade, registro || null, hashedPassword]
        );
        
        // Retorna apenas os dados do profissional (primeira linha do resultado)
        return newProfessional.rows[0];
    },

    /**
     * BUSCAR PROFISSIONAL PELO EMAIL
     * 
     * Esta função busca um profissional específico pelo seu email.
     * É usada principalmente no processo de login.
     * 
     * Parâmetros:
     * - email: Email do profissional a ser buscado
     * 
     * Retorna: Dados do profissional (se encontrado) ou undefined (se não encontrado)
     */
    findProfessionalByEmail: async (email) => {
        // Executa consulta SQL para buscar pelo email
        const professional = await DatabaseManager.query(
            'SELECT * FROM profissionais WHERE email = $1',
            [email]
        );
        
        // Retorna o primeiro resultado (ou undefined se não encontrou)
        return professional.rows[0];
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
    },

    /**
     * LISTAR TODOS OS PROFISSIONAIS
     * 
     * Esta função retorna uma lista com todos os profissionais cadastrados.
     * É usada principalmente para a busca de profissionais pelos usuários.
     * 
     * Retorna: Array com todos os profissionais cadastrados
     */
    findAll: async () => {
        // Executa consulta SQL para buscar todos os profissionais
        const { rows } = await DatabaseManager.query('SELECT * FROM profissionais');
        
        // Retorna todos os resultados
        return rows;
    },

    /**
     * BUSCAR PROFISSIONAL PELO ID
     * 
     * Esta função busca um profissional específico pelo seu ID único.
     * É usada quando precisamos dos dados de um profissional em particular.
     * 
     * Parâmetros:
     * - id: ID único do profissional
     * 
     * Retorna: Dados do profissional (se encontrado) ou undefined (se não encontrado)
     */
    findById: async (id) => {
        // Executa consulta SQL para buscar pelo ID
        const { rows } = await DatabaseManager.query('SELECT * FROM profissionais WHERE id = $1', [id]);
        
        // Retorna o primeiro resultado (ou undefined se não encontrou)
        return rows[0];
    },

    /**
     * ATUALIZAR DADOS DE UM PROFISSIONAL
     * 
     * Esta função atualiza os dados de um profissional existente no banco de dados.
     * Se uma nova senha for fornecida, ela será criptografada antes de ser salva.
     * 
     * Parâmetros:
     * - id: ID do profissional a ser atualizado
     * - data: Objeto com os novos dados do profissional
     * 
     * Retorna: Dados atualizados do profissional
     */
    update: async (id, data) => {
        // Extrai os dados do objeto recebido
        const { nome, telefone, email, cidade, especialidade, registro, senha } = data;

        // Se uma nova senha foi fornecida, criptografa ela
        let hashedPassword = senha;
        if (senha) {
            hashedPassword = await PasswordUtils.hashPassword(senha);
        }

        // Executa a consulta SQL para atualizar os dados
        const result = await DatabaseManager.query(
            `UPDATE profissionais SET 
            nome = $1, telefone = $2, email = $3, cidade = $4, 
            especialidade = $5, registro = $6, senha = $7 
            WHERE id = $8 RETURNING *`,
            [nome, telefone, email, cidade, especialidade, registro || null, hashedPassword, id]
        );

        // Retorna os dados atualizados
        return result.rows[0];
    },

    /**
     * REMOVER PROFISSIONAL DO BANCO DE DADOS
     * 
     * Esta função remove permanentemente um profissional do banco de dados.
     * ATENÇÃO: Esta operação não pode ser desfeita!
     * 
     * Parâmetros:
     * - id: ID do profissional a ser removido
     * 
     * Retorna: Dados do profissional removido (se bem-sucedido)
     */
    delete: async (id) => {
        try {
            // Executa a consulta SQL para remover o profissional
            const result = await DatabaseManager.query(
                'DELETE FROM profissionais WHERE id = $1 RETURNING *',
                [id]
            );
            
            // Retorna os dados do profissional removido
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao excluir profissional no modelo:', error);
            throw error; // Re-lança o erro para ser tratado pelo controller
        }
    },
};

module.exports = ProfessionalModel;
