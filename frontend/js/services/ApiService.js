/**
 * Serviço de API para o frontend
 * Segue os princípios SOLID e boas práticas de programação
 * Responsável por todas as comunicações HTTP com o backend
 */

class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        this.timeout = 10000; // 10 segundos
    }

    /**
     * Configura headers padrão para requisições
     * @param {Object} headers - Headers adicionais
     * @returns {Object} Headers configurados
     */
    getHeaders(headers = {}) {
        return {
            ...this.defaultHeaders,
            ...headers
        };
    }

    /**
     * Executa uma requisição HTTP
     * @param {string} url - URL da requisição
     * @param {Object} options - Opções da requisição
     * @returns {Promise<Object>} Resposta da requisição
     */
    async request(url, options = {}) {
        const config = {
            headers: this.getHeaders(options.headers),
            timeout: this.timeout,
            ...options
        };

        try {
            console.log(`🌐 Requisição ${config.method || 'GET'} para: ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Resposta recebida de: ${url}`, data);
            
            return data;
        } catch (error) {
            console.error(`❌ Erro na requisição para ${url}:`, error);
            throw error;
        }
    }

    /**
     * Executa uma requisição GET
     * @param {string} endpoint - Endpoint da API
     * @param {Object} params - Parâmetros da query
     * @returns {Promise<Object>} Resposta da requisição
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
        
        // Adiciona parâmetros à URL
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.toString(), { method: 'GET' });
    }

    /**
     * Executa uma requisição POST
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise<Object>} Resposta da requisição
     */
    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Executa uma requisição PUT
     * @param {string} endpoint - Endpoint da API
     * @param {Object} data - Dados a serem enviados
     * @returns {Promise<Object>} Resposta da requisição
     */
    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Executa uma requisição DELETE
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<Object>} Resposta da requisição
     */
    async delete(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, { method: 'DELETE' });
    }

    // ===== MÉTODOS ESPECÍFICOS PARA USUÁRIOS =====

    /**
     * Registra um novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Resposta da requisição
     */
    async registerUser(userData) {
        return this.post('/users/register', userData);
    }

    /**
     * Faz login de um usuário
     * @param {Object} loginData - Dados de login
     * @returns {Promise<Object>} Resposta da requisição
     */
    async loginUser(loginData) {
        return this.post('/users/login', loginData);
    }

    /**
     * Busca profissionais por cidade
     * @param {string} cidade - Cidade para busca
     * @returns {Promise<Object>} Lista de profissionais
     */
    async searchProfessionals(cidade) {
        return this.get('/professionals/search', { cidade });
    }

    // ===== MÉTODOS ESPECÍFICOS PARA PROFISSIONAIS =====

    /**
     * Registra um novo profissional
     * @param {Object} professionalData - Dados do profissional
     * @returns {Promise<Object>} Resposta da requisição
     */
    async registerProfessional(professionalData) {
        return this.post('/professionals/register', professionalData);
    }

    /**
     * Faz login de um profissional
     * @param {Object} loginData - Dados de login
     * @returns {Promise<Object>} Resposta da requisição
     */
    async loginProfessional(loginData) {
        return this.post('/professionals/login', loginData);
    }

    /**
     * Atualiza dados de um profissional
     * @param {number} id - ID do profissional
     * @param {Object} updateData - Dados a serem atualizados
     * @returns {Promise<Object>} Resposta da requisição
     */
    async updateProfessional(id, updateData) {
        return this.put(`/professionals/${id}`, updateData);
    }

    /**
     * Exclui um profissional
     * @param {number} id - ID do profissional
     * @returns {Promise<Object>} Resposta da requisição
     */
    async deleteProfessional(id) {
        return this.delete(`/professionals/${id}`);
    }

    /**
     * Obtém dados de um profissional por ID
     * @param {number} id - ID do profissional
     * @returns {Promise<Object>} Dados do profissional
     */
    async getProfessionalById(id) {
        return this.get(`/professionals/${id}`);
    }

    // ===== MÉTODOS DE UTILIDADE =====

    /**
     * Verifica se o servidor está online
     * @returns {Promise<boolean>} True se online, false caso contrário
     */
    async checkServerHealth() {
        try {
            const response = await fetch('/health');
            return response.ok;
        } catch (error) {
            console.error('❌ Servidor não está respondendo:', error);
            return false;
        }
    }

    /**
     * Obtém estatísticas do servidor (apenas em desenvolvimento)
     * @returns {Promise<Object>} Estatísticas do servidor
     */
    async getServerStats() {
        if (process.env.NODE_ENV === 'development') {
            return this.get('/stats');
        }
        throw new Error('Estatísticas do servidor disponíveis apenas em desenvolvimento');
    }

    /**
     * Configura timeout para requisições
     * @param {number} timeout - Timeout em milissegundos
     */
    setTimeout(timeout) {
        this.timeout = timeout;
    }

    /**
     * Adiciona um interceptor para todas as requisições
     * @param {Function} interceptor - Função interceptor
     */
    addRequestInterceptor(interceptor) {
        const originalRequest = this.request.bind(this);
        
        this.request = async (url, options) => {
            const interceptedOptions = interceptor(url, options);
            return originalRequest(url, interceptedOptions);
        };
    }

    /**
     * Adiciona um interceptor para todas as respostas
     * @param {Function} interceptor - Função interceptor
     */
    addResponseInterceptor(interceptor) {
        const originalRequest = this.request.bind(this);
        
        this.request = async (url, options) => {
            const response = await originalRequest(url, options);
            return interceptor(response);
        };
    }
}

// Exporta uma instância singleton
const apiService = new ApiService();
export default apiService; 