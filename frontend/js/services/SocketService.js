/**
 * Serviço de Socket.IO para o frontend
 */

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.eventListeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.initializeSocket();
    }

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

    setupEventHandlers() {
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Conectado ao servidor Socket.IO');
            this.emit('connection_established');
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('❌ Desconectado do servidor Socket.IO:', reason);
            this.emit('connection_lost', reason);
            
            if (reason === 'io server disconnect') {
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Erro de conexão Socket.IO:', error);
            this.handleConnectionError();
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconectado após ${attemptNumber} tentativas`);
            this.emit('reconnected', attemptNumber);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Falha na reconexão após todas as tentativas');
            this.emit('reconnection_failed');
        });
    }

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

    on(event, callback) {
        if (!this.socket) {
            console.warn('⚠️ Socket não inicializado');
            return;
        }

        this.socket.on(event, callback);
        this.eventListeners.set(event, callback);
        console.log(`👂 Listener adicionado para: ${event}`);
    }

    off(event) {
        if (!this.socket) {
            return;
        }

        const callback = this.eventListeners.get(event);
        if (callback) {
            this.socket.off(event, callback);
            this.eventListeners.delete(event);
            console.log(`🔇 Listener removido para: ${event}`);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.eventListeners.clear();
            console.log('🔌 Socket desconectado');
        }
    }

    // Métodos específicos para chat
    login(userId, type) {
        this.emit('login', { userId, type });
    }

    sendMessage(fromUserId, toProfessionalId, message, fromUserName) {
        this.emit('send_message', {
            fromUserId,
            toProfessionalId,
            message,
            fromUserName
        });
    }

    sendProfessionalMessage(fromProfessionalId, toUserId, message, fromProfessionalName) {
        this.emit('send_professional_message', {
            fromProfessionalId,
            toUserId,
            message,
            fromProfessionalName
        });
    }

    onReceiveMessage(callback) {
        this.on('receive_message', callback);
    }

    onReceiveProfessionalMessage(callback) {
        this.on('receive_professional_message', callback);
    }

    // Métodos de utilidade
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    setReconnectConfig(maxAttempts, delay) {
        this.maxReconnectAttempts = maxAttempts;
        this.reconnectDelay = delay;
    }
}

// Instância global do serviço
const socketService = new SocketService();

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocketService;
} else {
    window.SocketService = SocketService;
    window.socketService = socketService;
} 