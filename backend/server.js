/**
 * Servidor principal da aplicação Sistema de Cuidadores
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const SocketService = require('./services/SocketService');
const { DatabaseManager } = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const professionalRoutes = require('./routes/professionalRoutes');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
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

    initializeMiddleware() {
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',') : 
                '*',
            credentials: true
        }));

        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        this.app.use(express.static(path.join(__dirname, '../frontend')));

        this.app.use(this.requestLogger);

        if (process.env.NODE_ENV === 'production') {
            const compression = require('compression');
            this.app.use(compression());
        }
    }

    requestLogger(req, res, next) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        });
        next();
    }

    initializeRoutes() {
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/professionals', professionalRoutes);

        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

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

        this.app.get(/^\/(?!api).*/, (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
    }

    initializeSocketService() {
        try {
            this.socketService = new SocketService(this.io);
            console.log('Serviço de Socket.IO inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar serviço de Socket.IO:', error);
            throw error;
        }
    }

    initializeErrorHandling() {
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Endpoint não encontrado',
                path: req.originalUrl,
                method: req.method
            });
        });

        this.app.use((error, req, res, next) => {
            console.error('Erro na aplicação:', error);

            const statusCode = error.statusCode || 500;
            const message = error.message || 'Erro interno do servidor';

            const response = {
                error: message,
                timestamp: new Date().toISOString()
            };

            if (process.env.NODE_ENV === 'development') {
                response.stack = error.stack;
            }

            res.status(statusCode).json(response);
        });

        process.on('uncaughtException', (error) => {
            console.error('Exceção não capturada:', error);
            this.gracefulShutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promise rejeitada não tratada:', reason);
            this.gracefulShutdown();
        });
    }

    async start() {
        try {
            const dbConnected = await DatabaseManager.testConnection();
            if (!dbConnected) {
                throw new Error('Não foi possível conectar ao banco de dados');
            }

            this.server.listen(this.port, () => {
                console.log(`🚀 Servidor rodando na porta ${this.port}`);
                console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 URL: http://localhost:${this.port}`);
                console.log(`🏥 Sistema de Cuidadores iniciado com sucesso!`);
            });

            this.setupGracefulShutdown();

        } catch (error) {
            console.error('Erro ao inicializar servidor:', error);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(`\n📴 Recebido sinal ${signal}. Iniciando graceful shutdown...`);
            
            this.server.close(async () => {
                console.log('🔒 Servidor HTTP fechado');
                
                try {
                    await DatabaseManager.close();
                    console.log('🗄️ Conexões com banco de dados fechadas');
                    
                    console.log('✅ Graceful shutdown concluído');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Erro durante graceful shutdown:', error);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                console.error('⏰ Timeout durante graceful shutdown. Forçando fechamento...');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    gracefulShutdown() {
        console.log('🔄 Iniciando graceful shutdown...');
        this.server.close(() => {
            console.log('✅ Servidor fechado');
            process.exit(0);
        });
    }
}

const server = new Server();
server.start().catch(error => {
    console.error('❌ Falha ao inicializar servidor:', error);
    process.exit(1);
});

module.exports = server;
