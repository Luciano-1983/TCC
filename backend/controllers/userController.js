/**
 * CONTROLLER DE USUÁRIOS COMUNS
 * 
 * Este arquivo contém todas as funções que lidam com operações relacionadas
 * aos usuários comuns (famílias que buscam cuidadores).
 * 
 * Funcionalidades:
 * - register: Cadastra um novo usuário
 * - login: Autentica um usuário existente
 */

// Importação do modelo para operações no banco de dados
const UserModel = require('../models/userModel');

const UserController = {

    /**
     * CADASTRO DE NOVO USUÁRIO
     * 
     * Esta função processa o cadastro de um novo usuário (família).
     * Recebe os dados do formulário e salva no banco de dados.
     * 
     * Dados recebidos:
     * - nome: Nome completo do usuário
     * - email: Email para login
     * - senha: Senha para acesso ao sistema
     */
    register: async (req, res) => {
        // Extrai os dados enviados pelo formulário
        const { nome, email, senha } = req.body;

        // Logs para debug (apenas em desenvolvimento)
        console.log('=== REGISTRO DE USUÁRIO ===');
        console.log('Dados recebidos:', { nome, email, senha: senha ? '***' : 'undefined' });

        try {
            // Cria o usuário no banco de dados
            const user = await UserModel.create(nome, email, senha); 
            console.log('Usuário registrado com sucesso:', user.id);
            
            // Retorna os dados do usuário criado (sem a senha)
            res.json(user);
        } catch (err) {
            console.error('Erro no registro:', err.message);
            console.error('Stack trace:', err.stack);
            res.status(500).send('Erro ao registrar usuário');
        }
    },

    /**
     * LOGIN DE USUÁRIO
     * 
     * Esta função autentica um usuário no sistema.
     * Verifica se o email e senha estão corretos.
     * 
     * Dados recebidos:
     * - email: Email do usuário
     * - senha: Senha do usuário
     * 
     * Retorna:
     * - Dados do usuário (se login for bem-sucedido)
     * - Erro 401 (se email ou senha estiverem incorretos)
     */
    login: async (req, res) => {
        // Extrai email e senha do formulário de login
        const { email, senha } = req.body;

        // Logs detalhados para debug (apenas em desenvolvimento)
        console.log('=== TENTATIVA DE LOGIN ===');
        console.log('Email recebido:', email);
        console.log('Senha recebida:', senha ? '***' : 'undefined');
        console.log('Tipo do email:', typeof email);
        console.log('Tipo da senha:', typeof senha);

        try {
            // Busca o usuário pelo email no banco de dados
            console.log('Buscando usuário no banco...');
            const user = await UserModel.findUserByEmail(email); 
            
            console.log('Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário NÃO encontrado');
            if (user) {
                console.log('ID do usuário encontrado:', user.id);
                console.log('Email do usuário encontrado:', user.email);
            }

            // Se encontrou o usuário, verifica a senha
            if (user) {
                console.log('Verificando senha...');
                // Compara a senha digitada com a senha criptografada no banco
                const isPasswordValid = await UserModel.verifyPassword(senha, user.senha);
                console.log('Senha válida:', isPasswordValid);
                
                if (isPasswordValid) {
                    // Login bem-sucedido - retorna os dados do usuário
                    console.log('Login realizado com sucesso para:', email);
                    res.json(user);
                } else {
                    // Senha incorreta
                    console.log('Senha inválida para:', email);
                    res.status(401).send('Credenciais inválidas');
                }
            } else {
                // Email não encontrado
                console.log('Usuário não encontrado para email:', email);
                res.status(401).send('Credenciais inválidas');
            }
        } catch (err) {
            console.error('Erro no login:', err.message);
            console.error('Stack trace completo:', err.stack);
            res.status(500).send('Erro ao fazer login');
        }
        console.log('=== FIM DA TENTATIVA DE LOGIN ===\n');
    }
};

module.exports = UserController;