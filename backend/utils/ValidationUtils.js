/**
 * UTILITÁRIOS PARA VALIDAÇÃO DE DADOS
 * 
 * Este arquivo contém todas as funções responsáveis por validar os dados
 * enviados pelos usuários antes de serem salvos no banco de dados.
 * 
 * As validações garantem que:
 * - Os dados estão no formato correto
 * - Os campos obrigatórios foram preenchidos
 * - Os dados atendem aos critérios de segurança
 * - As regras de negócio são respeitadas
 * 
 * IMPORTANTE: Cuidadores não precisam de registro profissional!
 */

class ValidationUtils {
    /**
     * VALIDAR FORMATO DE EMAIL
     * 
     * Esta função verifica se um email está no formato correto.
     * Um email válido deve ter: usuario@dominio.com
     * 
     * Parâmetros:
     * - email: Email a ser validado
     * 
     * Retorna: true (se válido) ou false (se inválido)
     */
    static isValidEmail(email) {
        // Verifica se o email foi fornecido e é uma string
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        // Expressão regular para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * VALIDAR SENHA
     * 
     * Esta função verifica se uma senha atende aos critérios de segurança.
     * 
     * Critérios de validação:
     * - Deve ter pelo menos 6 caracteres
     * - Deve ter no máximo 50 caracteres
     * - É obrigatória
     * 
     * Parâmetros:
     * - password: Senha a ser validada
     * 
     * Retorna: Objeto com isValid (true/false) e lista de erros
     */
    static validatePassword(password) {
        const errors = [];
        
        // Verifica se a senha foi fornecida
        if (!password || typeof password !== 'string') {
            errors.push('Senha é obrigatória');
            return { isValid: false, errors };
        }

        // Verifica tamanho mínimo
        if (password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }

        // Verifica tamanho máximo
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

    /**
     * VALIDAR REGISTRO PROFISSIONAL
     * 
     * Esta é uma das validações mais importantes do sistema!
     * 
     * REGRA ESPECIAL: Cuidadores não precisam de registro profissional
     * porque esta especialidade não possui vínculo com órgão regulamentador.
     * 
     * Para outras especialidades (Enfermeiro, Técnico de Enfermagem):
     * - Registro é obrigatório
     * - Deve ter pelo menos 3 caracteres
     * - Deve ter no máximo 50 caracteres
     * 
     * Parâmetros:
     * - registration: Número do registro profissional
     * - specialty: Especialidade do profissional
     * 
     * Retorna: Objeto com isValid (true/false) e lista de erros
     */
    static validateRegistration(registration, specialty = null) {
        const errors = [];
        
        // REGRA ESPECIAL: Cuidadores não precisam de registro profissional
        if (specialty === 'Cuidador') {
            // Se for cuidador, registro é opcional
            // Se foi fornecido, valida o formato
            if (registration && typeof registration === 'string') {
                const trimmedRegistration = registration.trim();
                if (trimmedRegistration.length > 0) {
                    if (trimmedRegistration.length < 3) {
                        errors.push('Registro profissional deve ter pelo menos 3 caracteres');
                    }
                    if (trimmedRegistration.length > 50) {
                        errors.push('Registro profissional deve ter no máximo 50 caracteres');
                    }
                }
            }
        } else {
            // Para outras especialidades, registro é obrigatório
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

        const registrationValidation = this.validateRegistration(professionalData.registro, professionalData.especialidade);
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