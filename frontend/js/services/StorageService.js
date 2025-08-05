/**
 * Serviço de armazenamento local
 * Segue os princípios SOLID e boas práticas de programação
 * Responsável por gerenciar localStorage e sessionStorage
 */

class StorageService {
    constructor() {
        this.storage = window.localStorage;
        this.sessionStorage = window.sessionStorage;
        this.prefix = 'sistema_cuidadores_';
    }

    /**
     * Gera uma chave completa com prefixo
     * @param {string} key - Chave base
     * @returns {string} Chave completa
     */
    getFullKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Armazena um valor no localStorage
     * @param {string} key - Chave
     * @param {any} value - Valor a ser armazenado
     * @param {number} ttl - Tempo de vida em segundos (opcional)
     */
    set(key, value, ttl = null) {
        try {
            const fullKey = this.getFullKey(key);
            const data = {
                value: value,
                timestamp: Date.now()
            };

            if (ttl) {
                data.expiresAt = Date.now() + (ttl * 1000);
            }

            this.storage.setItem(fullKey, JSON.stringify(data));
            console.log(`💾 Dados armazenados: ${key}`);
        } catch (error) {
            console.error(`❌ Erro ao armazenar dados: ${key}`, error);
            throw error;
        }
    }

    /**
     * Obtém um valor do localStorage
     * @param {string} key - Chave
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} Valor armazenado ou defaultValue
     */
    get(key, defaultValue = null) {
        try {
            const fullKey = this.getFullKey(key);
            const item = this.storage.getItem(fullKey);

            if (!item) {
                return defaultValue;
            }

            const data = JSON.parse(item);

            // Verifica se o item expirou
            if (data.expiresAt && Date.now() > data.expiresAt) {
                this.remove(key);
                return defaultValue;
            }

            console.log(`📖 Dados recuperados: ${key}`);
            return data.value;
        } catch (error) {
            console.error(`❌ Erro ao recuperar dados: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * Remove um item do localStorage
     * @param {string} key - Chave
     */
    remove(key) {
        try {
            const fullKey = this.getFullKey(key);
            this.storage.removeItem(fullKey);
            console.log(`🗑️ Dados removidos: ${key}`);
        } catch (error) {
            console.error(`❌ Erro ao remover dados: ${key}`, error);
        }
    }

    /**
     * Verifica se uma chave existe no localStorage
     * @param {string} key - Chave
     * @returns {boolean} True se existe, false caso contrário
     */
    has(key) {
        const fullKey = this.getFullKey(key);
        return this.storage.getItem(fullKey) !== null;
    }

    /**
     * Limpa todos os dados do sistema no localStorage
     */
    clear() {
        try {
            const keys = Object.keys(this.storage);
            const systemKeys = keys.filter(key => key.startsWith(this.prefix));
            
            systemKeys.forEach(key => {
                this.storage.removeItem(key);
            });

            console.log(`🧹 Todos os dados do sistema removidos`);
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
        }
    }

    /**
     * Obtém todas as chaves do sistema
     * @returns {Array<string>} Lista de chaves
     */
    getKeys() {
        try {
            const keys = Object.keys(this.storage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('❌ Erro ao obter chaves:', error);
            return [];
        }
    }

    /**
     * Obtém o tamanho total dos dados do sistema
     * @returns {number} Tamanho em bytes
     */
    getSize() {
        try {
            const keys = this.getKeys();
            let totalSize = 0;

            keys.forEach(key => {
                const fullKey = this.getFullKey(key);
                const item = this.storage.getItem(fullKey);
                if (item) {
                    totalSize += item.length;
                }
            });

            return totalSize;
        } catch (error) {
            console.error('❌ Erro ao calcular tamanho:', error);
            return 0;
        }
    }

    // ===== MÉTODOS ESPECÍFICOS PARA USUÁRIOS =====

    /**
     * Armazena dados do usuário logado
     * @param {Object} userData - Dados do usuário
     */
    setLoggedUser(userData) {
        this.set('logged_user', userData);
    }

    /**
     * Obtém dados do usuário logado
     * @returns {Object|null} Dados do usuário ou null
     */
    getLoggedUser() {
        return this.get('logged_user');
    }

    /**
     * Remove dados do usuário logado
     */
    removeLoggedUser() {
        this.remove('logged_user');
    }

    /**
     * Verifica se há um usuário logado
     * @returns {boolean} True se há usuário logado, false caso contrário
     */
    hasLoggedUser() {
        return this.has('logged_user') && this.getLoggedUser() !== null;
    }

    // ===== MÉTODOS ESPECÍFICOS PARA PROFISSIONAIS =====

    /**
     * Armazena dados do profissional logado
     * @param {Object} professionalData - Dados do profissional
     */
    setLoggedProfessional(professionalData) {
        this.set('logged_professional', professionalData);
    }

    /**
     * Obtém dados do profissional logado
     * @returns {Object|null} Dados do profissional ou null
     */
    getLoggedProfessional() {
        return this.get('logged_professional');
    }

    /**
     * Remove dados do profissional logado
     */
    removeLoggedProfessional() {
        this.remove('logged_professional');
    }

    /**
     * Verifica se há um profissional logado
     * @returns {boolean} True se há profissional logado, false caso contrário
     */
    hasLoggedProfessional() {
        return this.has('logged_professional') && this.getLoggedProfessional() !== null;
    }

    // ===== MÉTODOS PARA SESSION STORAGE =====

    /**
     * Armazena um valor no sessionStorage
     * @param {string} key - Chave
     * @param {any} value - Valor a ser armazenado
     */
    setSession(key, value) {
        try {
            const fullKey = this.getFullKey(key);
            this.sessionStorage.setItem(fullKey, JSON.stringify(value));
            console.log(`💾 Dados de sessão armazenados: ${key}`);
        } catch (error) {
            console.error(`❌ Erro ao armazenar dados de sessão: ${key}`, error);
        }
    }

    /**
     * Obtém um valor do sessionStorage
     * @param {string} key - Chave
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} Valor armazenado ou defaultValue
     */
    getSession(key, defaultValue = null) {
        try {
            const fullKey = this.getFullKey(key);
            const item = this.sessionStorage.getItem(fullKey);

            if (!item) {
                return defaultValue;
            }

            const value = JSON.parse(item);
            console.log(`📖 Dados de sessão recuperados: ${key}`);
            return value;
        } catch (error) {
            console.error(`❌ Erro ao recuperar dados de sessão: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * Remove um item do sessionStorage
     * @param {string} key - Chave
     */
    removeSession(key) {
        try {
            const fullKey = this.getFullKey(key);
            this.sessionStorage.removeItem(fullKey);
            console.log(`🗑️ Dados de sessão removidos: ${key}`);
        } catch (error) {
            console.error(`❌ Erro ao remover dados de sessão: ${key}`, error);
        }
    }

    /**
     * Limpa todos os dados de sessão do sistema
     */
    clearSession() {
        try {
            const keys = Object.keys(this.sessionStorage);
            const systemKeys = keys.filter(key => key.startsWith(this.prefix));
            
            systemKeys.forEach(key => {
                this.sessionStorage.removeItem(key);
            });

            console.log(`🧹 Todos os dados de sessão removidos`);
        } catch (error) {
            console.error('❌ Erro ao limpar dados de sessão:', error);
        }
    }

    // ===== MÉTODOS DE UTILIDADE =====

    /**
     * Obtém estatísticas do armazenamento
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            localStorageSize: this.getSize(),
            localStorageKeys: this.getKeys().length,
            sessionStorageKeys: Object.keys(this.sessionStorage)
                .filter(key => key.startsWith(this.prefix)).length,
            hasLoggedUser: this.hasLoggedUser(),
            hasLoggedProfessional: this.hasLoggedProfessional()
        };
    }

    /**
     * Limpa dados expirados
     */
    cleanupExpired() {
        try {
            const keys = this.getKeys();
            let cleanedCount = 0;

            keys.forEach(key => {
                const fullKey = this.getFullKey(key);
                const item = this.storage.getItem(fullKey);

                if (item) {
                    const data = JSON.parse(item);
                    if (data.expiresAt && Date.now() > data.expiresAt) {
                        this.remove(key);
                        cleanedCount++;
                    }
                }
            });

            if (cleanedCount > 0) {
                console.log(`🧹 ${cleanedCount} itens expirados removidos`);
            }
        } catch (error) {
            console.error('❌ Erro ao limpar dados expirados:', error);
        }
    }

    /**
     * Exporta todos os dados do sistema
     * @returns {Object} Dados exportados
     */
    export() {
        try {
            const keys = this.getKeys();
            const data = {};

            keys.forEach(key => {
                data[key] = this.get(key);
            });

            return data;
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            return {};
        }
    }

    /**
     * Importa dados para o sistema
     * @param {Object} data - Dados a serem importados
     */
    import(data) {
        try {
            Object.keys(data).forEach(key => {
                this.set(key, data[key]);
            });

            console.log(`📥 Dados importados com sucesso`);
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
        }
    }
}

// Exporta uma instância singleton
const storageService = new StorageService();
export default storageService; 