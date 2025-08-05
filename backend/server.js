/**
 * Servidor principal da aplicação Sistema de Cuidadores
 * Segue os princípios SOLID e boas práticas de programação
 * 
 * Princípios aplicados:
 * - SRP (Single Responsibility Principle): Cada módulo tem uma responsabilidade específica
 * - OCP (Open/Closed Principle): Extensível sem modificar código existente
 * - LSP (Liskov Substitution Principle): Interfaces bem definidas
 * - ISP (Interface Segregation Principle): Interfaces específicas para cada necessidade
 * - DIP (Dependency Inversion Principle): Dependências injetadas
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importações de módulos refatorados
const SocketService = require('./services/SocketService');
const { DatabaseManager } = require('./config/database');

// Importações de rotas
const userRoutes = require('./routes/userRoutes');
const professionalRoutes = require('./routes/professionalRoutes');

/**
 * Classe principal do servidor
 * Responsável por inicializar e configurar toda a aplicação
 */
class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*", // Em produção, especificar domínios permitidos
                methods: ["GET", "POST"]
            }
        });
        this.port = process.env.PORT || 5000;
        this.socketService = null;
        
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeSocketService();
        this.initializeErrorHandling();
    }

    /**
     * Inicializa os middlewares da aplicação
     */
    initializeMiddleware() {
        // Middleware para CORS
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',') : 
                '*',
            credentials: true
        }));

        // Middleware para parsing de JSON
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        // Middleware para servir arquivos estáticos
        this.app.use(express.static(path.join(__dirname, '../frontend')));

        // Middleware para logging de requisições
        this.app.use(this.requestLogger);

        // Middleware para compressão (se necessário)
        if (process.env.NODE_ENV === 'production') {
            const compression = require('compression');
            this.app.use(compression());
        }
    }

    /**
     * Middleware para logging de requisições
     * @param {Object} req - Objeto de requisição
     * @param {Object} res - Objeto de resposta
     * @param {Function} next - Função next
     */
    requestLogger(req, res, next) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        });
        next();
    }

    /**
     * Inicializa as rotas da aplicação
     */
    initializeRoutes() {
        // Rotas da API
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/professionals', professionalRoutes);

        // Rota de health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Rota para estatísticas do sistema (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            this.app.get('/api/stats', (req, res) => {
                if (this.socketService) {
                    const stats = this.socketService.getConnectionStats();
                    res.json({
                        connections: stats,
                        memory: process.memoryUsage(),
                        uptime: process.uptime()
                    });
                } else {
                    res.json({ error: 'Socket service not initialized' });
                }
            });
        }

        // Rota para servir o frontend (SPA)
        this.app.get(/^\/(?!api).*/, (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
    }

    /**
     * Inicializa o serviço de Socket.IO
     */
    initializeSocketService() {
        try {
            this.socketService = new SocketService(this.io);
            console.log('Serviço de Socket.IO inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar serviço de Socket.IO:', error);
            throw error;
        }
    }

    /**
     * Inicializa o tratamento de erros
     */
    initializeErrorHandling() {
        // Middleware para capturar erros 404
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Endpoint não encontrado',
                path: req.originalUrl,
                method: req.method
            });
        });

        // Middleware global para tratamento de erros
        this.app.use((error, req, res, next) => {
            console.error('Erro na aplicação:', error);

            // Determina o status code apropriado
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Erro interno do servidor';

            // Em desenvolvimento, inclui stack trace
            const response = {
                error: message,
                timestamp: new Date().toISOString()
            };

            if (process.env.NODE_ENV === 'development') {
                response.stack = error.stack;
            }

            res.status(statusCode).json(response);
        });

        // Tratamento de erros não capturados
        process.on('uncaughtException', (error) => {
            console.error('Exceção não capturada:', error);
            this.gracefulShutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promise rejeitada não tratada:', reason);
            this.gracefulShutdown();
        });
    }

    /**
     * Inicializa o servidor
     */
    async start() {
        try {
            // Testa conexão com banco de dados
            const dbConnected = await DatabaseManager.testConnection();
            if (!dbConnected) {
                throw new Error('Não foi possível conectar ao banco de dados');
            }

            // Inicia o servidor
            this.server.listen(this.port, () => {
                console.log(`🚀 Servidor rodando na porta ${this.port}`);
                console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 URL: http://localhost:${this.port}`);
                console.log(`🏥 Sistema de Cuidadores iniciado com sucesso!`);
            });

            // Configura graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('Erro ao inicializar servidor:', error);
            process.exit(1);
        }
    }

    /**
     * Configura o graceful shutdown do servidor
     */
    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(`\n📴 Recebido sinal ${signal}. Iniciando graceful shutdown...`);
            
            this.server.close(async () => {
                console.log('🔒 Servidor HTTP fechado');
                
                try {
                    // Fecha conexões com banco de dados
                    await DatabaseManager.close();
                    console.log('🗄️ Conexões com banco de dados fechadas');
                    
                    console.log('✅ Graceful shutdown concluído');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Erro durante graceful shutdown:', error);
                    process.exit(1);
                }
            });

            // Força fechamento após 10 segundos
            setTimeout(() => {
                console.error('⏰ Timeout durante graceful shutdown. Forçando fechamento...');
                process.exit(1);
            }, 10000);
        };

        // Captura sinais de término
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    /**
     * Executa graceful shutdown
     */
    gracefulShutdown() {
        console.log('🔄 Iniciando graceful shutdown...');
        this.server.close(() => {
            console.log('✅ Servidor fechado');
            process.exit(0);
        });
    }
}

// Inicializa e inicia o servidor
const server = new Server();
server.start().catch(error => {
    console.error('❌ Falha ao inicializar servidor:', error);
    process.exit(1);
});

module.exports = server;
