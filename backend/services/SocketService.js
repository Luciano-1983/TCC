/**
 * Serviço responsável por gerenciar todas as conexões e eventos do Socket.IO
 * Segue o princípio de Responsabilidade Única (SRP) do SOLID
 */
class SocketService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // Usuários conectados
        this.connectedProfessionals = new Map(); // Profissionais conectados
        this.initializeEventHandlers();
    }

    /**
     * Inicializa todos os event handlers do Socket.IO
     */
    initializeEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Usuário conectado:', socket.id);
            
            // Configura os event handlers para este socket
            this.setupSocketEventHandlers(socket);
        });
    }

    /**
     * Configura os event handlers específicos para um socket
     * @param {Object} socket - Instância do socket
     */
    setupSocketEventHandlers(socket) {
        // Event handler para login
        socket.on('login', (data) => this.handleLogin(socket, data));

        // Event handler para envio de mensagens de usuário
        socket.on('send_message', (data) => this.handleUserMessage(socket, data));

        // Event handler para envio de mensagens de profissional
        socket.on('send_professional_message', (data) => this.handleProfessionalMessage(socket, data));

        // Event handler para envio de dados do profissional
        socket.on('send_professional_data', (data) => this.handleProfessionalData(socket, data));

        // Event handler para desconexão
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    /**
     * Gerencia o login de usuários e profissionais
     * @param {Object} socket - Instância do socket
     * @param {Object} data - Dados do login
     */
    handleLogin(socket, data) {
        const { type, userId } = data;
        
        if (type === 'user') {
            this.connectedUsers.set(socket.id, userId);
            console.log(`Usuário conectado: ${userId} com socket id: ${socket.id}`);
        } else if (type === 'professional') {
            this.connectedProfessionals.set(socket.id, userId);
            console.log(`Profissional conectado: ${userId} com socket id: ${socket.id}`);
        }
    }

    /**
     * Gerencia o envio de mensagens de usuário para profissional
     * @param {Object} socket - Instância do socket
     * @param {Object} data - Dados da mensagem
     */
    handleUserMessage(socket, data) {
        const { fromUserId, toProfessionalId, message, fromUserName } = data;

        console.log(`Enviando mensagem de usuário ${fromUserId} para profissional ${toProfessionalId}: ${message}`);

        // Busca o socket do profissional destinatário
        const professionalSocketId = this.findSocketIdByUserId(this.connectedProfessionals, toProfessionalId);
        
        if (professionalSocketId) {
            this.io.to(professionalSocketId).emit('receive_message', {
                fromUserId,
                fromUserName,
                message,
                type: 'user'
            });
            console.log(`Mensagem enviada ao profissional: ${toProfessionalId}`);
        } else {
            console.log(`Profissional ${toProfessionalId} não está conectado`);
        }
    }

    /**
     * Gerencia o envio de mensagens de profissional para usuário
     * @param {Object} socket - Instância do socket
     * @param {Object} data - Dados da mensagem
     */
    handleProfessionalMessage(socket, data) {
        const { fromProfessionalId, toUserId, message, fromProfessionalName } = data;

        console.log(`Enviando mensagem de profissional ${fromProfessionalId} para usuário ${toUserId}: ${message}`);

        // Busca o socket do usuário destinatário
        const userSocketId = this.findSocketIdByUserId(this.connectedUsers, toUserId);
        
        if (userSocketId) {
            this.io.to(userSocketId).emit('receive_message', {
                fromProfessionalId,
                fromProfessionalName,
                message,
                type: 'professional'
            });
            console.log(`Mensagem enviada ao usuário: ${toUserId}`);
        } else {
            console.log(`Usuário ${toUserId} não está conectado`);
        }
    }

    /**
     * Gerencia o envio de dados do profissional para usuário
     * @param {Object} socket - Instância do socket
     * @param {Object} data - Dados do profissional
     */
    handleProfessionalData(socket, data) {
        const { fromProfessionalId, toUserId, dados, fromProfessionalName } = data;

        console.log(`Enviando dados do profissional ${fromProfessionalId} para usuário ${toUserId}`);

        // Busca o socket do usuário destinatário
        const userSocketId = this.findSocketIdByUserId(this.connectedUsers, toUserId);
        
        if (userSocketId) {
            this.io.to(userSocketId).emit('receive_professional_data', {
                fromProfessionalId,
                fromProfessionalName,
                dados,
                type: 'professional_data'
            });
            console.log(`Dados enviados ao usuário: ${toUserId}`);
        } else {
            console.log(`Usuário ${toUserId} não está conectado`);
        }
    }

    /**
     * Gerencia a desconexão de usuários e profissionais
     * @param {Object} socket - Instância do socket
     */
    handleDisconnect(socket) {
        // Remove usuário desconectado
        if (this.connectedUsers.has(socket.id)) {
            const userId = this.connectedUsers.get(socket.id);
            this.connectedUsers.delete(socket.id);
            console.log('Usuário desconectado:', userId);
        }

        // Remove profissional desconectado
        if (this.connectedProfessionals.has(socket.id)) {
            const professionalId = this.connectedProfessionals.get(socket.id);
            this.connectedProfessionals.delete(socket.id);
            console.log('Profissional desconectado:', professionalId);
        }
    }

    /**
     * Encontra o socket ID baseado no ID do usuário
     * @param {Map} userMap - Mapa de usuários conectados
     * @param {string} userId - ID do usuário
     * @returns {string|null} Socket ID ou null se não encontrado
     */
    findSocketIdByUserId(userMap, userId) {
        for (const [socketId, id] of userMap.entries()) {
            if (id === userId) {
                return socketId;
            }
        }
        return null;
    }

    /**
     * Obtém estatísticas de conexões ativas
     * @returns {Object} Estatísticas de conexões
     */
    getConnectionStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            connectedProfessionals: this.connectedProfessionals.size,
            totalConnections: this.connectedUsers.size + this.connectedProfessionals.size
        };
    }
}

module.exports = SocketService; 