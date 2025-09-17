/**
 * CONTROLLER DE PROFISSIONAIS DE SAÚDE
 * 
 * Este arquivo contém todas as funções que lidam com operações relacionadas
 * aos profissionais de saúde (cuidadores, enfermeiros, técnicos).
 * 
 * Cada função representa uma operação diferente:
 * - register: Cadastra um novo profissional
 * - login: Autentica um profissional existente
 * - getAll: Lista todos os profissionais
 * - getById: Busca um profissional específico
 * - update: Atualiza dados de um profissional
 * - delete: Remove um profissional do sistema
 */

// Importação dos módulos necessários
const ProfessionalModel = require('../models/professionalModel');  // Modelo para operações no banco
const ValidationUtils = require('../utils/ValidationUtils');        // Utilitário para validação de dados

const ProfessionalController = {
    
    /**
     * CADASTRO DE NOVO PROFISSIONAL
     * 
     * Esta função processa o cadastro de um novo profissional de saúde.
     * Ela recebe os dados do formulário, valida e salva no banco de dados.
     * 
     * Dados recebidos:
     * - nome: Nome completo do profissional
     * - telefone: Telefone para contato
     * - email: Email para login
     * - cidade: Cidade onde atende
     * - especialidade: Tipo de profissional (Cuidador, Enfermeiro, etc.)
     * - registro: Número do registro profissional (opcional para cuidadores)
     * - senha: Senha para acesso ao sistema
     */
    register: async (req, res) => {
        // Extrai os dados enviados pelo formulário
        const { nome, telefone, email, cidade, especialidade, registro, senha } = req.body;

        try {
            // Valida todos os dados antes de salvar
            // Verifica se estão no formato correto e se são obrigatórios
            const validation = ValidationUtils.validateProfessionalData({
                nome, telefone, email, cidade, especialidade, registro, senha
            });

            // Se a validação falhou, retorna erro com detalhes
            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    details: validation.errors
                });
            }

            // REGRA ESPECIAL: Cuidadores não precisam de registro profissional
            // Se a especialidade for "Cuidador", define o registro como null
            const registroFinal = especialidade === 'Cuidador' ? null : registro;

            // Salva o profissional no banco de dados
            const professional = await ProfessionalModel.createProfessional(
                nome, telefone, email, cidade, especialidade, registroFinal, senha
            );

            // Retorna os dados do profissional criado (sem a senha)
            res.json(professional);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao registrar profissional');
        }
    },

    /**
     * LOGIN DE PROFISSIONAL
     * 
     * Esta função autentica um profissional no sistema.
     * Verifica se o email e senha estão corretos.
     * 
     * Dados recebidos:
     * - email: Email do profissional
     * - senha: Senha do profissional
     * 
     * Retorna:
     * - Dados do profissional (se login for bem-sucedido)
     * - Erro 401 (se email ou senha estiverem incorretos)
     */
    login: async (req, res) => {
        // Extrai email e senha do formulário de login
        const { email, senha } = req.body;

        try {
            // Busca o profissional pelo email no banco de dados
            const professional = await ProfessionalModel.findProfessionalByEmail(email);

            // Se encontrou o profissional, verifica a senha
            if (professional) {
                // Compara a senha digitada com a senha criptografada no banco
                const isPasswordValid = await ProfessionalModel.verifyPassword(senha, professional.senha);
                
                if (isPasswordValid) {
                    // Login bem-sucedido - retorna os dados do profissional
                    res.json(professional);
                } else {
                    // Senha incorreta
                    res.status(401).send('Credenciais inválidas');
                }
            } else {
                // Email não encontrado
                res.status(401).send('Credenciais inválidas');
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erro ao fazer login');
        }
    },

    /**
     * LISTAR TODOS OS PROFISSIONAIS
     * 
     * Esta função retorna uma lista com todos os profissionais cadastrados.
     * É usada principalmente para a busca de profissionais pelos usuários.
     * 
     * Retorna:
     * - Array com todos os profissionais (se bem-sucedido)
     * - Erro 500 (se houver problema no banco de dados)
     */
    getAll: async (req, res) => {
        try {
            // Busca todos os profissionais no banco de dados
            const profissionais = await ProfessionalModel.findAll();
            
            // Retorna a lista de profissionais
            res.json(profissionais);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            res.status(500).send('Erro ao buscar profissionais');
        }
    },

    /**
     * BUSCAR PROFISSIONAL POR ID
     * 
     * Esta função busca um profissional específico pelo seu ID.
     * É usada quando precisamos dos dados de um profissional em particular.
     * 
     * Parâmetros recebidos:
     * - id: ID único do profissional (vem da URL)
     * 
     * Retorna:
     * - Dados do profissional (se encontrado)
     * - Erro 404 (se não encontrado)
     * - Erro 500 (se houver problema no banco)
     */
    getById: async (req, res) => {
        // Extrai o ID da URL (ex: /api/professionals/123)
        const { id } = req.params;

        try {
            // Busca o profissional pelo ID no banco de dados
            const profissional = await ProfessionalModel.findById(id);
            
            // Se não encontrou o profissional, retorna erro 404
            if (!profissional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            
            // Retorna os dados do profissional encontrado
            res.json(profissional);
        } catch (error) {
            console.error('Erro ao buscar profissional:', error);
            res.status(500).json({ message: 'Erro ao buscar profissional' });
        }
    },

    /**
     * ATUALIZAR DADOS DE PROFISSIONAL
     * 
     * Esta função permite que um profissional atualize seus próprios dados.
     * Valida os novos dados antes de salvar no banco.
     * 
     * Parâmetros recebidos:
     * - id: ID do profissional a ser atualizado (vem da URL)
     * - updatedData: Novos dados do profissional (vem do formulário)
     * 
     * Retorna:
     * - Dados atualizados do profissional (se bem-sucedido)
     * - Erro 400 (se dados inválidos)
     * - Erro 404 (se profissional não encontrado)
     * - Erro 500 (se houver problema no banco)
     */
    update: async (req, res) => {
        // Extrai o ID da URL e os novos dados do formulário
        const { id } = req.params;
        const updatedData = req.body;

        // Verifica se ID e dados foram fornecidos
        if (!id || !updatedData) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        // Lista dos campos obrigatórios para atualização
        const requiredFields = ['nome', 'email', 'senha', 'telefone', 'cidade', 'especialidade'];
        
        // Verifica se todos os campos obrigatórios foram preenchidos
        for (const field of requiredFields) {
            if (!updatedData[field]) {
                return res.status(400).json({ message: `Campo obrigatório faltando: ${field}` });
            }
        }

        try {
            // Valida todos os dados antes de salvar
            const validation = ValidationUtils.validateProfessionalData(updatedData);

            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    details: validation.errors
                });
            }

            // REGRA ESPECIAL: Cuidadores não precisam de registro profissional
            // Se a especialidade for "Cuidador", define o registro como null
            if (updatedData.especialidade === 'Cuidador') {
                updatedData.registro = null;
            }

            // Atualiza os dados no banco
            const updatedProfessional = await ProfessionalModel.update(id, updatedData);
            
            // Se não encontrou o profissional para atualizar
            if (!updatedProfessional) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            
            // Retorna os dados atualizados
            res.json(updatedProfessional);
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            res.status(500).json({ message: 'Erro ao atualizar profissional' });
        }
    },

    /**
     * REMOVER PROFISSIONAL DO SISTEMA
     * 
     * Esta função remove permanentemente um profissional do banco de dados.
     * ATENÇÃO: Esta operação não pode ser desfeita!
     * 
     * Parâmetros recebidos:
     * - id: ID do profissional a ser removido (vem da URL)
     * 
     * Retorna:
     * - Mensagem de sucesso (se removido com sucesso)
     * - Erro 404 (se profissional não encontrado)
     * - Erro 500 (se houver problema no banco)
     */
    delete: async (req, res) => {
        // Extrai o ID da URL
        const { id } = req.params;

        try {
            // Remove o profissional do banco de dados
            const deleted = await ProfessionalModel.delete(id);
            
            // Se não encontrou o profissional para remover
            if (!deleted) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }
            
            // Retorna mensagem de sucesso
            res.json({ message: 'Profissional removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover profissional:', error);
            res.status(500).json({ message: 'Erro ao remover profissional' });
        }
    }
};

module.exports = ProfessionalController;
