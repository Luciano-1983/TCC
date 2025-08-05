// Importa o Express e cria um novo roteador
const express = require('express');
const router = express.Router();

// Importa o controller que contém a lógica das operações com profissionais
const ProfessionalController = require('../controllers/professionalController');

// Rota para registrar um novo profissional
// Exemplo: POST /professionals/register
router.post('/register', ProfessionalController.register);

// Rota para login de profissional
// Exemplo: POST /professionals/login
router.post('/login', ProfessionalController.login);

// Rota para listar todos os profissionais cadastrados
// Exemplo: GET /professionals/
router.get('/', ProfessionalController.getAll);

// Rota para buscar um profissional específico por ID
// Exemplo: GET /professionals/5
router.get('/:id', ProfessionalController.getById);

// Rota para atualizar os dados de um profissional específico (via ID)
// Exemplo: PUT /professionals/5
router.put('/:id', ProfessionalController.update);

// Rota para excluir um profissional pelo ID
// Exemplo: DELETE /professionals/5
router.delete('/:id', ProfessionalController.delete);

// Exporta o roteador para ser usado no app principal
module.exports = router;
