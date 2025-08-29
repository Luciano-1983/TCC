/**
 * Serviço de armazenamento local
 */

class StorageService {
    constructor() {
        this.storage = window.localStorage;
        this.sessionStorage = window.sessionStorage;
        this.prefix = 'sistema_cuidadores_';
    }

    getFullKey(key) {
        return `${this.prefix}${key}`;
    }

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

    get(key, defaultValue = null) {
        try {
            const fullKey = this.getFullKey(key);
            const item = this.storage.getItem(fullKey);

            if (!item) {
                return defaultValue;
            }

            const data = JSON.parse(item);

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

    remove(key) {
        try {
            const fullKey = this.getFullKey(key);
            this.storage.removeItem(fullKey);
            console.log(`🗑️ Dados removidos: ${key}`);
        } catch (error) {
            console.error(`❌ Erro ao remover dados: ${key}`, error);
        }
    }

    has(key) {
        const fullKey = this.getFullKey(key);
        return this.storage.getItem(fullKey) !== null;
    }

    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            console.log('🗑️ Todos os dados do sistema removidos');
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
        }
    }

    // Métodos específicos para usuários
    setUser(userData) {
        this.set('user', userData);
    }

    getUser() {
        return this.get('user');
    }

    removeUser() {
        this.remove('user');
    }

    isUserLoggedIn() {
        return this.has('user');
    }

    // Métodos específicos para profissionais
    setProfessional(professionalData) {
        this.set('professional', professionalData);
    }

    getProfessional() {
        return this.get('professional');
    }

    removeProfessional() {
        this.remove('professional');
    }

    isProfessionalLoggedIn() {
        return this.has('professional');
    }

    // Métodos para session storage
    setSession(key, value) {
        try {
            const fullKey = this.getFullKey(key);
            this.sessionStorage.setItem(fullKey, JSON.stringify(value));
        } catch (error) {
            console.error(`❌ Erro ao armazenar na sessão: ${key}`, error);
        }
    }

    getSession(key, defaultValue = null) {
        try {
            const fullKey = this.getFullKey(key);
            const item = this.sessionStorage.getItem(fullKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`❌ Erro ao recuperar da sessão: ${key}`, error);
            return defaultValue;
        }
    }

    removeSession(key) {
        try {
            const fullKey = this.getFullKey(key);
            this.sessionStorage.removeItem(fullKey);
        } catch (error) {
            console.error(`❌ Erro ao remover da sessão: ${key}`, error);
        }
    }

    clearSession() {
        try {
            const keys = Object.keys(this.sessionStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
        }
    }

    // Métodos de utilidade
    getStorageSize() {
        try {
            let totalSize = 0;
            const keys = Object.keys(this.storage);
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const item = this.storage.getItem(key);
                    totalSize += item ? item.length : 0;
                }
            });
            
            return totalSize;
        } catch (error) {
            console.error('❌ Erro ao calcular tamanho do storage:', error);
            return 0;
        }
    }

    getStorageInfo() {
        return {
            totalSize: this.getStorageSize(),
            itemCount: this.getItemCount(),
            availableSpace: this.getAvailableSpace()
        };
    }

    getItemCount() {
        try {
            const keys = Object.keys(this.storage);
            return keys.filter(key => key.startsWith(this.prefix)).length;
        } catch (error) {
            console.error('❌ Erro ao contar itens:', error);
            return 0;
        }
    }

    getAvailableSpace() {
        try {
            const testKey = this.getFullKey('test_space');
            const testData = 'x'.repeat(1024 * 1024); // 1MB
            
            this.storage.setItem(testKey, testData);
            this.storage.removeItem(testKey);
            
            return 'Disponível';
        } catch (error) {
            return 'Indisponível';
        }
    }
}

// Instância global do serviço
const storageService = new StorageService();

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
} else {
    window.StorageService = StorageService;
    window.storageService = storageService;
} 