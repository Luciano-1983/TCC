/**
 * ROTAS DE PROFISSIONAIS DE SAÚDE
 * 
 * Este arquivo define todas as rotas (caminhos) que o sistema reconhece
 * para operações relacionadas aos profissionais de saúde.
 * 
 * As rotas funcionam como "endereços" que o frontend pode acessar
 * para realizar operações no banco de dados.
 * 
 * Estrutura das rotas:
 * - POST /register -> Cadastrar novo profissional
 * - POST /login -> Fazer login do profissional
 * - GET / -> Listar todos os profissionais
 * - GET /:id -> Buscar profissional específico
 * - PUT /:id -> Atualizar dados do profissional
 * - DELETE /:id -> Remover profissional
 */

// Importação das bibliotecas necessárias
const express = require('express');                                    // Framework para criar rotas
const router = express.Router();                                       // Criador de rotas do Express
const ProfessionalController = require('../controllers/professionalController'); // Controller que processa as requisições

// ========================================
// DEFINIÇÃO DAS ROTAS
// ========================================

// Rota para cadastrar um novo profissional
// Exemplo: POST /api/professionals/register
router.post('/register', ProfessionalController.register);

// Rota para fazer login de um profissional
// Exemplo: POST /api/professionals/login
router.post('/login', ProfessionalController.login);

// Rota para listar todos os profissionais
// Exemplo: GET /api/professionals
router.get('/', ProfessionalController.getAll);

// Rota para buscar um profissional específico pelo ID
// Exemplo: GET /api/professionals/123
router.get('/:id', ProfessionalController.getById);

// Rota para atualizar dados de um profissional
// Exemplo: PUT /api/professionals/123
router.put('/:id', ProfessionalController.update);

// Rota para remover um profissional do sistema
// Exemplo: DELETE /api/professionals/123
router.delete('/:id', ProfessionalController.delete);

// Exporta o router para ser usado no servidor principal
module.exports = router;
