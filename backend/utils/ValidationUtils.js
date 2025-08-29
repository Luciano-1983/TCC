/**
 * Utilitários para validação de dados
 */

class ValidationUtils {
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

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

        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        if (!nameRegex.test(trimmedName)) {
            errors.push('Nome contém caracteres inválidos');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

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

        if (trimmedCity.length > 100) {
            errors.push('Cidade deve ter no máximo 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateSpecialty(specialty) {
        const errors = [];
        
        if (!specialty || typeof specialty !== 'string') {
            errors.push('Especialidade é obrigatória');
            return { isValid: false, errors };
        }

        const trimmedSpecialty = specialty.trim();
        
        if (trimmedSpecialty.length < 2) {
            errors.push('Especialidade deve ter pelo menos 2 caracteres');
        }

        if (trimmedSpecialty.length > 100) {
            errors.push('Especialidade deve ter no máximo 100 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateRegistration(registration) {
        const errors = [];
        
        if (!registration || typeof registration !== 'string') {
            errors.push('Registro profissional é obrigatório');
            return { isValid: false, errors };
        }

        const trimmedRegistration = registration.trim();
        
        if (trimmedRegistration.length < 3) {
            errors.push('Registro profissional deve ter pelo menos 3 caracteres');
        }

        if (trimmedRegistration.length > 50) {
            errors.push('Registro profissional deve ter no máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateUserData(userData) {
        const errors = [];

        const nameValidation = this.validateName(userData.nome);
        if (!nameValidation.isValid) {
            errors.push(...nameValidation.errors);
        }

        if (!this.isValidEmail(userData.email)) {
            errors.push('Email inválido');
        }

        const passwordValidation = this.validatePassword(userData.senha);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateProfessionalData(professionalData) {
        const errors = [];

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

        const registrationValidation = this.validateRegistration(professionalData.registro);
        if (!registrationValidation.isValid) {
            errors.push(...registrationValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = ValidationUtils; 