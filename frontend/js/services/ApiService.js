/**
 * Serviço de API para o frontend
 */

class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        this.timeout = 10000;
    }

    getHeaders(headers = {}) {
        return {
            ...this.defaultHeaders,
            ...headers
        };
    }

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

    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.toString(), { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        
        return this.request(url, {
            method: 'DELETE'
        });
    }

    // Métodos específicos para usuários
    async registerUser(userData) {
        return this.post('/users/register', userData);
    }

    async loginUser(credentials) {
        return this.post('/users/login', credentials);
    }

    // Métodos específicos para profissionais
    async registerProfessional(professionalData) {
        return this.post('/professionals/register', professionalData);
    }

    async loginProfessional(credentials) {
        return this.post('/professionals/login', credentials);
    }

    async getAllProfessionals() {
        return this.get('/professionals');
    }

    async getProfessionalById(id) {
        return this.get(`/professionals/${id}`);
    }

    async updateProfessional(id, data) {
        return this.put(`/professionals/${id}`, data);
    }

    async deleteProfessional(id) {
        return this.delete(`/professionals/${id}`);
    }

    // Métodos de utilidade
    async healthCheck() {
        return this.get('/health');
    }

    async getStats() {
        return this.get('/stats');
    }
}

// Instância global do serviço
const apiService = new ApiService();

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
} else {
    window.ApiService = ApiService;
    window.apiService = apiService;
} 