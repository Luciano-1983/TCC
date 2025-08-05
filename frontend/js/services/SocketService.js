/**
 * Serviço de Socket.IO para o frontend
 * Segue os princípios SOLID e boas práticas de programação
 * Responsável por gerenciar todas as comunicações em tempo real
 */

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.eventListeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 segundo
        
        this.initializeSocket();
    }

    /**
     * Inicializa a conexão Socket.IO
     */
    initializeSocket() {
        try {
            this.socket = io();
            this.setupEventHandlers();
            console.log('🔌 Socket.IO inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar Socket.IO:', error);
            this.handleConnectionError();
        }
    }

    /**
     * Configura os event handlers do Socket.IO
     */
    setupEventHandlers() {
        // Event handler para conexão estabelecida
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Conectado ao servidor Socket.IO');
            this.emit('connection_established');
        });

        // Event handler para desconexão
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('❌ Desconectado do servidor Socket.IO:', reason);
            this.emit('connection_lost', reason);
            
            if (reason === 'io server disconnect') {
                // Reconexão manual necessária
                this.socket.connect();
            }
        });

        // Event handler para erros de conexão
        this.socket.on('connect_error', (error) => {
            console.error('❌ Erro de conexão Socket.IO:', error);
            this.handleConnectionError();
        });

        // Event handler para reconexão
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconectado após ${attemptNumber} tentativas`);
            this.emit('reconnected', attemptNumber);
        });

        // Event handler para falha na reconexão
        this.socket.on('reconnect_failed', () => {
            console.error('❌ Falha na reconexão após todas as tentativas');
            this.emit('reconnection_failed');
        });
    }

    /**
     * Gerencia erros de conexão
     */
    handleConnectionError() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.initializeSocket();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
            this.emit('max_reconnect_attempts_reached');
        }
    }

    /**
     * Emite um evento para o servidor
     * @param {string} event - Nome do evento
     * @param {Object} data - Dados a serem enviados
     */
    emit(event, data = {}) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Socket não conectado. Tentando reconectar...');
            this.initializeSocket();
            return;
        }

        try {
            this.socket.emit(event, data);
            console.log(`📤 Evento emitido: ${event}`, data);
        } catch (error) {
            console.error(`❌ Erro ao emitir evento ${event}:`, error);
        }
    }

    /**
     * Registra um listener para um evento
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função callback
     */
    on(event, callback) {
        if (!this.socket) {
            console.error('❌ Socket não inicializado');
            return;
        }

        // Armazena o listener para possível remoção posterior
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);

        this.socket.on(event, callback);
        console.log(`👂 Listener registrado para evento: ${event}`);
    }

    /**
     * Remove um listener específico
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função callback a ser removida
     */
    off(event, callback) {
        if (!this.socket) {
            return;
        }

        this.socket.off(event, callback);
        
        // Remove do mapa de listeners
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
        
        console.log(`🗑️ Listener removido para evento: ${event}`);
    }

    /**
     * Remove todos os listeners de um evento
     * @param {string} event - Nome do evento
     */
    offAll(event) {
        if (!this.socket) {
            return;
        }

        this.socket.off(event);
        
        if (this.eventListeners.has(event)) {
            this.eventListeners.delete(event);
        }
        
        console.log(`🗑️ Todos os listeners removidos para evento: ${event}`);
    }

    /**
     * Envia dados de login
     * @param {Object} loginData - Dados de login
     */
    sendLogin(loginData) {
        this.emit('login', loginData);
    }

    /**
     * Envia mensagem de usuário para profissional
     * @param {Object} messageData - Dados da mensagem
     */
    sendUserMessage(messageData) {
        this.emit('send_message', messageData);
    }

    /**
     * Envia mensagem de profissional para usuário
     * @param {Object} messageData - Dados da mensagem
     */
    sendProfessionalMessage(messageData) {
        this.emit('send_professional_message', messageData);
    }

    /**
     * Envia dados do profissional
     * @param {Object} data - Dados do profissional
     */
    sendProfessionalData(data) {
        this.emit('send_professional_data', data);
    }

    /**
     * Verifica se está conectado
     * @returns {boolean} True se conectado, false caso contrário
     */
    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }

    /**
     * Obtém estatísticas da conexão
     * @returns {Object} Estatísticas da conexão
     */
    getConnectionStats() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            eventListenersCount: this.eventListeners.size
        };
    }

    /**
     * Desconecta o socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            console.log('🔌 Socket desconectado manualmente');
        }
    }

    /**
     * Reconecta o socket manualmente
     */
    reconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.reconnectAttempts = 0;
        this.initializeSocket();
    }
}

// Exporta uma instância singleton
const socketService = new SocketService();
export default socketService; 