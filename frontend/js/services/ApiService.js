/**
 * SERVIÇO DE COMUNICAÇÃO COM O BACKEND (API)
 * 
 * Este arquivo é responsável por toda a comunicação entre o frontend
 * (interface do usuário) e o backend (servidor).
 * 
 * O que este serviço faz:
 * - Envia dados do frontend para o backend
 * - Recebe respostas do backend
 * - Gerencia erros de comunicação
 * - Padroniza todas as requisições HTTP
 * 
 * Exemplos de uso:
 * - Cadastrar usuário: apiService.registerUser(dados)
 * - Fazer login: apiService.loginUser(email, senha)
 * - Buscar profissionais: apiService.getAllProfessionals()
 */

class ApiService {
    constructor() {
        // URL base para todas as requisições (aponta para o backend)
        this.baseURL = '/api';
        
        // Cabeçalhos padrão para todas as requisições
        this.defaultHeaders = {
            'Content-Type': 'application/json',  // Indica que enviamos dados em formato JSON
        };
        
        // Tempo limite para requisições (10 segundos)
        this.timeout = 10000;
    }

    /**
     * CONFIGURA OS CABEÇALHOS DAS REQUISIÇÕES
     * 
     * Esta função combina os cabeçalhos padrão com cabeçalhos específicos
     * de cada requisição.
     * 
     * Parâmetros:
     * - headers: Cabeçalhos específicos para esta requisição
     * 
     * Retorna: Objeto com todos os cabeçalhos combinados
     */
    getHeaders(headers = {}) {
        return {
            ...this.defaultHeaders,  // Cabeçalhos padrão
            ...headers               // Cabeçalhos específicos (sobrescrevem os padrão)
        };
    }

    /**
     * FUNÇÃO PRINCIPAL DE REQUISIÇÃO
     * 
     * Esta é a função que realmente faz a comunicação com o backend.
     * Todas as outras funções (GET, POST, PUT, DELETE) usam esta função.
     * 
     * Parâmetros:
     * - url: Endereço para onde enviar a requisição
     * - options: Opções da requisição (método, dados, etc.)
     * 
     * Retorna: Dados recebidos do backend
     */
    async request(url, options = {}) {
        // Configura a requisição com todos os parâmetros necessários
        const config = {
            headers: this.getHeaders(options.headers),  // Cabeçalhos
            timeout: this.timeout,                      // Tempo limite
            ...options                                  // Outras opções
        };

        try {
            console.log(`🌐 Requisição ${config.method || 'GET'} para: ${url}`);
            
            // Faz a requisição para o backend
            const response = await fetch(url, config);
            
            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Converte a resposta para formato JSON
            const data = await response.json();
            console.log(`✅ Resposta recebida de: ${url}`, data);
            
            return data;
        } catch (error) {
            console.error(`❌ Erro na requisição para ${url}:`, error);
            throw error;  // Re-lança o erro para ser tratado por quem chamou
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