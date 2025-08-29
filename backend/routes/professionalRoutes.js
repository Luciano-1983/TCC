const express = require('express');
const router = express.Router();
const ProfessionalController = require('../controllers/professionalController');

router.post('/register', ProfessionalController.register);
router.post('/login', ProfessionalController.login);
router.get('/', ProfessionalController.getAll);
router.get('/:id', ProfessionalController.getById);
router.put('/:id', ProfessionalController.update);
router.delete('/:id', ProfessionalController.delete);

module.exports = router;
