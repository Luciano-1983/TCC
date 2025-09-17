/**
 * ROTAS DE USUÁRIOS COMUNS
 * 
 * Este arquivo define todas as rotas (caminhos) que o sistema reconhece
 * para operações relacionadas aos usuários comuns (famílias que buscam cuidadores).
 * 
 * As rotas funcionam como "endereços" que o frontend pode acessar
 * para realizar operações no banco de dados.
 * 
 * Estrutura das rotas:
 * - POST /register -> Cadastrar novo usuário
 * - POST /login -> Fazer login do usuário
 * 
 * Nota: Usuários têm menos funcionalidades que profissionais,
 * pois eles apenas buscam e conversam com profissionais.
 */

// Importação das bibliotecas necessárias
const express = require('express');                                    // Framework para criar rotas
const router = express.Router();                                       // Criador de rotas do Express
const UserController = require('../controllers/userController');       // Controller que processa as requisições

// ========================================
// DEFINIÇÃO DAS ROTAS
// ========================================

// Rota para cadastrar um novo usuário (família)
// Exemplo: POST /api/users/register
router.post('/register', UserController.register);

// Rota para fazer login de um usuário
// Exemplo: POST /api/users/login
router.post('/login', UserController.login);

// Exporta o router para ser usado no servidor principal
module.exports = router;
