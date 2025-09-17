/**
 * SERVIDOR PRINCIPAL DO SISTEMA DE CUIDADORES
 * 
 * Este arquivo é o coração da aplicação, responsável por:
 * - Configurar e iniciar o servidor web
 * - Gerenciar as conexões de chat em tempo real
 * - Conectar com o banco de dados
 * - Processar as requisições dos usuários
 * 
 * O sistema funciona como uma ponte entre o frontend (interface do usuário)
 * e o banco de dados, permitindo que profissionais e usuários se comuniquem
 */

// Importação das bibliotecas necessárias para o funcionamento do servidor
const express = require('express');        // Framework para criar o servidor web
const http = require('http');              // Módulo nativo do Node.js para HTTP
const socketIo = require('socket.io');     // Biblioteca para chat em tempo real
const cors = require('cors');              // Permite comunicação entre diferentes domínios
const bodyParser = require('body-parser'); // Processa dados enviados pelos formulários
const path = require('path');              // Trabalha com caminhos de arquivos

// Importação dos serviços personalizados do sistema
const SocketService = require('./services/SocketService');     // Gerencia as conversas em tempo real
const { DatabaseManager } = require('./config/database');      // Gerencia a conexão com o banco de dados

// Importação das rotas (caminhos) para diferentes tipos de usuários
const userRoutes = require('./routes/userRoutes');             // Rotas para usuários comuns (famílias)
const professionalRoutes = require('./routes/professionalRoutes'); // Rotas para profissionais de saúde

/**
 * CLASSE PRINCIPAL DO SERVIDOR
 * 
 * Esta classe organiza todo o funcionamento do servidor de forma estruturada.
 * É como se fosse o "cérebro" do sistema, coordenando todas as operações.
 */
class Server {
    constructor() {
        // Criação da aplicação Express (servidor web)
        this.app = express();
        
        // Criação do servidor HTTP (protocolo de comunicação web)
        this.server = http.createServer(this.app);
        
        // Configuração do Socket.IO para chat em tempo real
        // Permite que usuários e profissionais conversem instantaneamente
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",                    // Permite conexões de qualquer lugar
                methods: ["GET", "POST"]        // Permite apenas leitura e envio de dados
            }
        });
        
        // Define a porta onde o servidor irá funcionar (5000 é o padrão)
        this.port = process.env.PORT || 5000;
        
        // Variável para armazenar o serviço de chat (será inicializada depois)
        this.socketService = null;
        
        // Inicialização de todos os componentes do servidor
        this.initializeMiddleware();    // Configurações básicas do servidor
        this.initializeRoutes();        // Define os caminhos que o sistema reconhece
        this.initializeSocketService(); // Inicia o sistema de chat
        this.initializeErrorHandling(); // Configura tratamento de erros
    }

    /**
     * CONFIGURAÇÃO DOS MIDDLEWARES
     * 
     * Middlewares são como "filtros" que processam as requisições antes
     * de chegarem às rotas principais. É aqui que configuramos:
     * - Segurança (CORS)
     * - Processamento de dados
     * - Servir arquivos estáticos
     * - Logs de debug
     */
    initializeMiddleware() {
        // Configuração para funcionar com ferramentas de túnel (como ngrok)
        // Necessário para testar o sistema de forma externa
        this.app.set('trust proxy', true);
        
        // Configuração CORS - permite que o frontend se comunique com o backend
        // É como dar permissão para diferentes sites conversarem entre si
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS ? 
                process.env.ALLOWED_ORIGINS.split(',') : 
                '*',                    // Em desenvolvimento, aceita qualquer origem
            credentials: true           // Permite envio de cookies e autenticação
        }));

        // Configuração para processar dados JSON (formulários e APIs)
        // Limite de 10MB para permitir envio de imagens ou arquivos grandes
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        // Configuração para servir arquivos estáticos (HTML, CSS, JavaScript)
        // Aponta para a pasta frontend onde estão os arquivos da interface
        this.app.use(express.static(path.join(__dirname, '../frontend')));

        // Sistema de logs personalizado para debug
        // Registra todas as requisições para facilitar a identificação de problemas
        this.app.use(this.requestLogger);

        // Otimização para produção - comprime os dados para carregar mais rápido
        if (process.env.NODE_ENV === 'production') {
            const compression = require('compression');
            this.app.use(compression());
        }
    }

    /**
     * SISTEMA DE LOGS PERSONALIZADO
     * 
     * Este método registra todas as requisições que chegam ao servidor.
     * É muito útil para debug e monitoramento do sistema.
     * 
     * Para cada requisição, registra:
     * - Quem fez a requisição (IP)
     * - O que foi solicitado (URL e método)
     * - Quanto tempo demorou para processar
     * - Se houve erro ou sucesso
     */
    requestLogger(req, res, next) {
        // Marca o tempo de início para calcular a duração
        const start = Date.now();
        
        // Registra informações detalhadas da requisição
        console.log('=== NOVA REQUISIÇÃO ===');
        console.log('IP do cliente:', req.ip);                                    // Endereço de quem fez a requisição
        console.log('IP real (X-Forwarded-For):', req.headers['x-forwarded-for']); // IP real (útil com ngrok)
        console.log('User-Agent:', req.headers['user-agent']);                   // Navegador usado
        console.log('Host:', req.headers.host);                                  // Servidor acessado
        console.log('Método:', req.method);                                      // GET, POST, PUT, DELETE
        console.log('URL:', req.originalUrl);                                    // Caminho acessado
        
        // Se a requisição trouxe dados (formulário, JSON), registra também
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('Body:', JSON.stringify(req.body, null, 2));
        }
        
        // Quando a resposta for enviada, calcula e registra o tempo total
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
            console.log('=== FIM DA REQUISIÇÃO ===\n');
        });
        
        // Passa para o próximo middleware/rota
        next();
    }

    /**
     * CONFIGURAÇÃO DAS ROTAS DO SISTEMA
     * 
     * As rotas são como "endereços" que o sistema reconhece.
     * Cada rota aponta para uma funcionalidade específica.
     * 
     * Estrutura das rotas:
     * - /api/users/* -> Funcionalidades para usuários comuns (famílias)
     * - /api/professionals/* -> Funcionalidades para profissionais de saúde
     * - /health -> Verificação se o servidor está funcionando
     * - /api/test-db -> Teste de conexão com o banco de dados
     * - /* -> Qualquer outra rota serve o arquivo HTML principal
     */
    initializeRoutes() {
        // Rotas para usuários comuns (famílias que buscam cuidadores)
        this.app.use('/api/users', userRoutes);
        
        // Rotas para profissionais de saúde (cuidadores, enfermeiros, etc.)
        this.app.use('/api/professionals', professionalRoutes);

        // Rota de verificação de saúde do servidor
        // Útil para verificar se o sistema está funcionando
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',                                    // Status do servidor
                timestamp: new Date().toISOString(),             // Data e hora atual
                uptime: process.uptime(),                        // Tempo que o servidor está rodando
                environment: process.env.NODE_ENV || 'development' // Ambiente (desenvolvimento/produção)
            });
        });

        // Endpoint para testar se a conexão com o banco de dados está funcionando
        // Muito útil durante o desenvolvimento para verificar problemas
        this.app.get('/api/test-db', async (req, res) => {
            try {
                console.log('=== TESTE DE CONEXÃO COM BANCO ===');
                
                // Executa uma consulta simples no banco para testar a conexão
                const result = await DatabaseManager.query('SELECT NOW() as current_time, version() as db_version');
                console.log('Teste de banco OK:', result.rows[0]);
                
                // Retorna sucesso com informações do banco
                res.json({
                    success: true,
                    data: result.rows[0],
                    message: 'Conexão com banco estabelecida com sucesso'
                });
            } catch (error) {
                console.error('Erro no teste de banco:', error);
                
                // Retorna erro com detalhes (apenas em desenvolvimento)
                res.status(500).json({
                    success: false,
                    error: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });

        // Endpoint de estatísticas (apenas em desenvolvimento)
        // Mostra informações sobre conexões ativas e uso de memória
        if (process.env.NODE_ENV === 'development') {
            this.app.get('/api/stats', (req, res) => {
                if (this.socketService) {
                    const stats = this.socketService.getConnectionStats();
                    res.json({
                        connections: stats,              // Estatísticas de chat
                        memory: process.memoryUsage(),   // Uso de memória do servidor
                        uptime: process.uptime()         // Tempo de funcionamento
                    });
                } else {
                    res.json({ error: 'Socket service not initialized' });
                }
            });
        }

        // Rota padrão - serve o arquivo HTML principal para qualquer caminho
        // que não seja uma API. Isso permite que o frontend funcione com roteamento
        this.app.get(/^\/(?!api).*/, (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
    }

    /**
     * INICIALIZAÇÃO DO SISTEMA DE CHAT
     * 
     * O Socket.IO permite comunicação em tempo real entre usuários e profissionais.
     * É aqui que configuramos o serviço responsável pelas conversas instantâneas.
     */
    initializeSocketService() {
        try {
            // Cria o serviço de chat passando a instância do Socket.IO
            this.socketService = new SocketService(this.io);
            console.log('Serviço de Socket.IO inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar serviço de Socket.IO:', error);
            throw error; // Para a execução se não conseguir inicializar o chat
        }
    }

    /**
     * CONFIGURAÇÃO DO TRATAMENTO DE ERROS
     * 
     * Este método define como o sistema deve lidar com erros que possam ocorrer.
     * É importante para manter o sistema estável e informar adequadamente sobre problemas.
     */
    initializeErrorHandling() {
        // Middleware para rotas não encontradas (404)
        // Quando alguém acessa um caminho que não existe
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Endpoint não encontrado',
                path: req.originalUrl,    // Caminho que foi tentado acessar
                method: req.method        // Método usado (GET, POST, etc.)
            });
        });

        // Middleware para capturar erros gerais da aplicação
        // Qualquer erro não tratado passa por aqui
        this.app.use((error, req, res, next) => {
            console.error('Erro na aplicação:', error);

            // Define o código de status HTTP (500 = erro interno do servidor)
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Erro interno do servidor';

            // Monta a resposta de erro
            const response = {
                error: message,
                timestamp: new Date().toISOString()
            };

            // Em desenvolvimento, inclui detalhes técnicos do erro
            if (process.env.NODE_ENV === 'development') {
                response.stack = error.stack;
            }

            res.status(statusCode).json(response);
        });

        // Captura erros não tratados que podem quebrar o servidor
        process.on('uncaughtException', (error) => {
            console.error('Exceção não capturada:', error);
            this.gracefulShutdown(); // Fecha o servidor de forma controlada
        });

        // Captura promessas rejeitadas não tratadas
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promise rejeitada não tratada:', reason);
            this.gracefulShutdown(); // Fecha o servidor de forma controlada
        });
    }

    /**
     * MÉTODO PRINCIPAL - INICIA O SERVIDOR
     * 
     * Este é o método mais importante da classe. Ele:
     * 1. Testa a conexão com o banco de dados
     * 2. Inicia o servidor web
     * 3. Configura o encerramento controlado
     * 
     * Se algo der errado, o servidor não inicia e mostra o erro.
     */
    async start() {
        try {
            // Primeiro, testa se consegue conectar com o banco de dados
            console.log('🔍 Testando conexão com banco de dados...');
            const dbConnected = await DatabaseManager.testConnection();
            
            // Se não conseguir conectar, para tudo
            if (!dbConnected) {
                throw new Error('Não foi possível conectar ao banco de dados');
            }
            console.log('✅ Banco de dados conectado com sucesso!');

            // Inicia o servidor web na porta definida
            // 0.0.0.0 significa que aceita conexões de qualquer IP (necessário para ngrok)
            this.server.listen(this.port, '0.0.0.0', () => {
                console.log(`🚀 Servidor rodando na porta ${this.port}`);
                console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 URL Local: http://localhost:${this.port}`);
                console.log(`🌐 Servidor aceita conexões de qualquer IP (0.0.0.0)`);
                console.log(`🏥 Sistema de Cuidadores iniciado com sucesso!`);
            });

            // Configura o encerramento controlado do servidor
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('Erro ao inicializar servidor:', error);
            process.exit(1); // Fecha o processo com erro
        }
    }

    /**
     * CONFIGURAÇÃO DO ENCERRAMENTO CONTROLADO
     * 
     * "Graceful shutdown" significa fechar o servidor de forma organizada:
     * 1. Para de aceitar novas conexões
     * 2. Fecha as conexões existentes
     * 3. Fecha a conexão com o banco de dados
     * 4. Só então encerra o processo
     * 
     * Isso evita perda de dados e problemas de integridade.
     */
    setupGracefulShutdown() {
        // Função que executa o encerramento controlado
        const shutdown = (signal) => {
            console.log(`\n📴 Recebido sinal ${signal}. Iniciando graceful shutdown...`);
            
            // Fecha o servidor HTTP (para de aceitar novas requisições)
            this.server.close(async () => {
                console.log('🔒 Servidor HTTP fechado');
                
                try {
                    // Fecha a conexão com o banco de dados
                    await DatabaseManager.close();
                    console.log('🗄️ Conexões com banco de dados fechadas');
                    
                    console.log('✅ Graceful shutdown concluído');
                    process.exit(0); // Encerra o processo com sucesso
                } catch (error) {
                    console.error('❌ Erro durante graceful shutdown:', error);
                    process.exit(1); // Encerra o processo com erro
                }
            });

            // Timeout de segurança - se demorar mais de 10 segundos, força o fechamento
            setTimeout(() => {
                console.error('⏰ Timeout durante graceful shutdown. Forçando fechamento...');
                process.exit(1);
            }, 10000);
        };

        // Configura os sinais do sistema operacional para encerramento
        process.on('SIGTERM', () => shutdown('SIGTERM')); // Sinal de término (Ctrl+C)
        process.on('SIGINT', () => shutdown('SIGINT'));   // Sinal de interrupção
    }

    /**
     * MÉTODO SIMPLES DE ENCERRAMENTO
     * 
     * Versão simplificada do encerramento, usada em casos de erro crítico.
     * Fecha o servidor sem fazer todas as verificações do graceful shutdown.
     */
    gracefulShutdown() {
        console.log('🔄 Iniciando graceful shutdown...');
        this.server.close(() => {
            console.log('✅ Servidor fechado');
            process.exit(0);
        });
    }
}

// ========================================
// INICIALIZAÇÃO DO SISTEMA
// ========================================

// Cria uma instância do servidor
const server = new Server();

// Inicia o servidor e trata erros de inicialização
server.start().catch(error => {
    console.error('❌ Falha ao inicializar servidor:', error);
    process.exit(1); // Encerra o processo com erro
});

// Exporta o servidor para uso em outros arquivos (se necessário)
module.exports = server;