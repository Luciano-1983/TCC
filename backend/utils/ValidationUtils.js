/**
 * Utilitários para validação de dados
 * Segue o princípio de Responsabilidade Única (SRP) do SOLID
 * Centraliza todas as validações do sistema
 */

/**
 * Classe responsável por validar dados de entrada
 */
class ValidationUtils {
    /**
     * Valida se um email é válido
     * @param {string} email - Email a ser validado
     * @returns {boolean} True se válido, false caso contrário
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida se uma senha atende aos critérios mínimos
     * @param {string} password - Senha a ser validada
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validatePassword(password) {
        const errors = [];
        
        if (!password || typeof password !== 'string') {
            errors.push('Senha é obrigatória');
            return { isValid: false, errors };
        }

        if (password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }

        if (password.length > 50) {
            errors.push('Senha deve ter no máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se um nome é válido
     * @param {string} name - Nome a ser validado
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateName(name) {
        const errors = [];
        
        if (!name || typeof name !== 'string') {
            errors.push('Nome é obrigatório');
            return { isValid: false, errors };
        }

        const trimmedName = name.trim();
        
        if (trimmedName.length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (trimmedName.length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres');
        }

        // Verifica se contém apenas letras, espaços e caracteres especiais comuns
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        if (!nameRegex.test(trimmedName)) {
            errors.push('Nome contém caracteres inválidos');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se um telefone é válido
     * @param {string} phone - Telefone a ser validado
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validatePhone(phone) {
        const errors = [];
        
        if (!phone || typeof phone !== 'string') {
            errors.push('Telefone é obrigatório');
            return { isValid: false, errors };
        }

        // Remove todos os caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            errors.push('Telefone deve ter 10 ou 11 dígitos');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se uma cidade é válida
     * @param {string} city - Cidade a ser validada
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateCity(city) {
        const errors = [];
        
        if (!city || typeof city !== 'string') {
            errors.push('Cidade é obrigatória');
            return { isValid: false, errors };
        }

        const trimmedCity = city.trim();
        
        if (trimmedCity.length < 2) {
            errors.push('Cidade deve ter pelo menos 2 caracteres');
        }

        if (trimmedCity.length > 50) {
            errors.push('Cidade deve ter no máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se uma especialidade é válida
     * @param {string} specialty - Especialidade a ser validada
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateSpecialty(specialty) {
        const errors = [];
        
        if (!specialty || typeof specialty !== 'string') {
            errors.push('Especialidade é obrigatória');
            return { isValid: false, errors };
        }

        const trimmedSpecialty = specialty.trim();
        
        if (trimmedSpecialty.length < 3) {
            errors.push('Especialidade deve ter pelo menos 3 caracteres');
        }

        if (trimmedSpecialty.length > 100) {
            errors.push('Especialidade deve ter no máximo 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se um registro profissional é válido
     * @param {string} registration - Registro a ser validado
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateProfessionalRegistration(registration) {
        const errors = [];
        
        if (!registration || typeof registration !== 'string') {
            errors.push('Registro profissional é obrigatório');
            return { isValid: false, errors };
        }

        const trimmedRegistration = registration.trim();
        
        if (trimmedRegistration.length < 3) {
            errors.push('Registro profissional deve ter pelo menos 3 caracteres');
        }

        if (trimmedRegistration.length > 20) {
            errors.push('Registro profissional deve ter no máximo 20 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida dados de login
     * @param {Object} loginData - Dados de login
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateLoginData(loginData) {
        const errors = [];
        
        if (!loginData) {
            errors.push('Dados de login são obrigatórios');
            return { isValid: false, errors };
        }

        if (!this.isValidEmail(loginData.email)) {
            errors.push('Email inválido');
        }

        const passwordValidation = this.validatePassword(loginData.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida dados de registro de usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateUserRegistration(userData) {
        const errors = [];
        
        if (!userData) {
            errors.push('Dados do usuário são obrigatórios');
            return { isValid: false, errors };
        }

        const nameValidation = this.validateName(userData.name);
        if (!nameValidation.isValid) {
            errors.push(...nameValidation.errors);
        }

        if (!this.isValidEmail(userData.email)) {
            errors.push('Email inválido');
        }

        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }

        const phoneValidation = this.validatePhone(userData.phone);
        if (!phoneValidation.isValid) {
            errors.push(...phoneValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida dados de registro de profissional
     * @param {Object} professionalData - Dados do profissional
     * @returns {Object} Objeto com resultado da validação e mensagens
     */
    static validateProfessionalRegistration(professionalData) {
        const errors = [];
        
        if (!professionalData) {
            errors.push('Dados do profissional são obrigatórios');
            return { isValid: false, errors };
        }

        const nameValidation = this.validateName(professionalData.nome);
        if (!nameValidation.isValid) {
            errors.push(...nameValidation.errors);
        }

        if (!this.isValidEmail(professionalData.email)) {
            errors.push('Email inválido');
        }

        const passwordValidation = this.validatePassword(professionalData.senha);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }

        const phoneValidation = this.validatePhone(professionalData.telefone);
        if (!phoneValidation.isValid) {
            errors.push(...phoneValidation.errors);
        }

        const cityValidation = this.validateCity(professionalData.cidade);
        if (!cityValidation.isValid) {
            errors.push(...cityValidation.errors);
        }

        const specialtyValidation = this.validateSpecialty(professionalData.especialidade);
        if (!specialtyValidation.isValid) {
            errors.push(...specialtyValidation.errors);
        }

        const registrationValidation = this.validateProfessionalRegistration(professionalData.registro);
        if (!registrationValidation.isValid) {
            errors.push(...registrationValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitiza uma string removendo caracteres perigosos
     * @param {string} input - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    static sanitizeString(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove caracteres < e >
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, ''); // Remove event handlers
    }

    /**
     * Valida se um ID é válido
     * @param {string|number} id - ID a ser validado
     * @returns {boolean} True se válido, false caso contrário
     */
    static isValidId(id) {
        if (!id) {
            return false;
        }
        
        const numId = parseInt(id);
        return !isNaN(numId) && numId > 0;
    }
}

module.exports = ValidationUtils; 