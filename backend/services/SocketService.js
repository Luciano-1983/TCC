/**
 * SERVIÇO DE CHAT EM TEMPO REAL (SOCKET.IO)
 * 
 * Este arquivo é responsável por gerenciar todas as conversas em tempo real
 * entre usuários e profissionais de saúde.
 * 
 * O que este serviço faz:
 * - Gerencia conexões de chat em tempo real
 * - Envia mensagens instantâneas entre usuários e profissionais
 * - Controla quem está online e disponível para conversar
 * - Gerencia o compartilhamento de dados do profissional
 * 
 * Como funciona:
 * 1. Quando alguém acessa o sistema, uma "conexão" é criada
 * 2. O sistema lembra quem está conectado
 * 3. Quando alguém envia uma mensagem, ela é entregue instantaneamente
 * 4. Quando alguém sai do sistema, a conexão é removida
 */

class SocketService {
    constructor(io) {
        // Instância do Socket.IO (sistema de chat)
        this.io = io;
        
        // Lista de usuários conectados (famílias)
        this.connectedUsers = new Map();
        
        // Lista de profissionais conectados (cuidadores, enfermeiros, etc.)
        this.connectedProfessionals = new Map();
        
        // Inicia o sistema de chat
        this.initializeEventHandlers();
    }

    /**
     * INICIALIZA O SISTEMA DE CHAT
     * 
     * Esta função configura o que acontece quando alguém se conecta ao chat.
     * É como "ligar" o sistema de conversas.
     */
    initializeEventHandlers() {
        // Quando alguém se conecta ao chat
        this.io.on('connection', (socket) => {
            console.log('Usuário conectado:', socket.id);
            
            // Configura todas as funcionalidades de chat para esta pessoa
            this.setupSocketEventHandlers(socket);
        });
    }

    /**
     * CONFIGURA AS FUNCIONALIDADES DE CHAT
     * 
     * Esta função define o que cada pessoa pode fazer no chat:
     * - Fazer login (se identificar no sistema)
     * - Enviar mensagens
     * - Compartilhar dados
     * - Desconectar
     * 
     * Parâmetros:
     * - socket: Conexão da pessoa que se conectou
     */
    setupSocketEventHandlers(socket) {
        // Quando alguém faz login no chat
        socket.on('login', (data) => this.handleLogin(socket, data));

        // Quando um usuário (família) envia mensagem para profissional
        socket.on('send_message', (data) => this.handleUserMessage(socket, data));

        // Quando um profissional envia mensagem para usuário
        socket.on('send_professional_message', (data) => this.handleProfessionalMessage(socket, data));

        // Quando um profissional compartilha seus dados com usuário
        socket.on('send_professional_data', (data) => this.handleProfessionalData(socket, data));

        // Quando alguém sai do chat
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    /**
     * GERENCIA O LOGIN NO CHAT
     * 
     * Esta função registra quem está conectado no chat.
     * É como "marcar presença" - o sistema sabe quem está online.
     * 
     * Parâmetros:
     * - socket: Conexão da pessoa
     * - data: Dados do login (tipo: usuário ou profissional, ID da pessoa)
     */
    handleLogin(socket, data) {
        const { type, userId } = data;
        
        if (type === 'user') {
            // Registra que um usuário (família) está conectado
            this.connectedUsers.set(socket.id, userId);
            console.log(`Usuário conectado: ${userId} com socket id: ${socket.id}`);
        } else if (type === 'professional') {
            // Registra que um profissional está conectado
            this.connectedProfessionals.set(socket.id, userId);
            console.log(`Profissional conectado: ${userId} com socket id: ${socket.id}`);
        }
    }

    /**
     * ENVIA MENSAGEM DE USUÁRIO PARA PROFISSIONAL
     * 
     * Esta função pega uma mensagem de um usuário (família) e entrega
     * instantaneamente para o profissional escolhido.
     * 
     * Parâmetros:
     * - socket: Conexão de quem enviou a mensagem
     * - data: Dados da mensagem (quem enviou, para quem, o que foi escrito)
     */
    handleUserMessage(socket, data) {
        const { fromUserId, toProfessionalId, message, fromUserName } = data;

        console.log(`Enviando mensagem de usuário ${fromUserId} para profissional ${toProfessionalId}: ${message}`);

        // Procura o profissional no chat para entregar a mensagem
        const professionalSocketId = this.findSocketIdByUserId(this.connectedProfessionals, toProfessionalId);
        
        if (professionalSocketId) {
            // Profissional está online - entrega a mensagem
            this.io.to(professionalSocketId).emit('receive_message', {
                fromUserId,
                fromUserName,
                message,
                type: 'user'
            });
            console.log(`Mensagem enviada ao profissional: ${toProfessionalId}`);
        } else {
            // Profissional não está online - não pode entregar
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