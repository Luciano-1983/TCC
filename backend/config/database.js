/**
 * CONFIGURAÇÃO E GERENCIAMENTO DO BANCO DE DADOS
 * 
 * Este arquivo é responsável por toda a comunicação com o banco de dados PostgreSQL.
 * É como o "tradutor" entre o sistema e o banco de dados.
 * 
 * O que este arquivo faz:
 * - Configura a conexão com o banco de dados
 * - Gerencia um "pool" de conexões (reutiliza conexões para melhor performance)
 * - Executa consultas SQL (SELECT, INSERT, UPDATE, DELETE)
 * - Controla transações (operações que devem ser feitas juntas)
 * - Testa se a conexão está funcionando
 * 
 * IMPORTANTE: Este arquivo é usado por todos os outros arquivos que precisam
 * acessar o banco de dados (models, controllers, etc.)
 */

// Importa a biblioteca do PostgreSQL para Node.js
const { Pool } = require('pg');

/**
 * CONFIGURAÇÕES DO BANCO DE DADOS
 * 
 * Estas configurações definem como o sistema se conecta ao banco.
 * Em produção, os valores vêm de variáveis de ambiente por segurança.
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',           // Endereço do servidor do banco
    port: process.env.DB_PORT || 5432,                  // Porta do PostgreSQL (padrão 5432)
    database: process.env.DB_NAME || 'caregiver_db',    // Nome do banco de dados
    user: process.env.DB_USER || 'postgres',            // Usuário do banco
    password: process.env.DB_PASSWORD || 'nova_senha',  // Senha do banco
    max: 20,                                            // Máximo de conexões simultâneas
    idleTimeoutMillis: 30000,                          // Tempo limite para conexões ociosas (30s)
    connectionTimeoutMillis: 2000,                     // Tempo limite para conectar (2s)
};

/**
 * POOL DE CONEXÕES
 * 
 * O pool é como um "estacionamento" de conexões com o banco.
 * Em vez de criar uma nova conexão a cada operação, o sistema
 * reutiliza conexões existentes, tornando tudo mais rápido.
 */
const pool = new Pool(dbConfig);

/**
 * CONFIGURAÇÃO DE EVENTOS DO POOL
 * 
 * O pool pode gerar eventos quando algo acontece.
 * Aqui configuramos o que fazer em cada situação.
 */

// Quando acontece um erro inesperado no pool
pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
    process.exit(-1); // Para o servidor se houver erro crítico
});

// Quando uma nova conexão é criada com sucesso
pool.on('connect', () => {
    console.log('Nova conexão criada no pool de banco de dados');
});

/**
 * GERENCIADOR DE BANCO DE DADOS
 * 
 * Esta classe contém todas as funções necessárias para trabalhar com o banco.
 * É como uma "caixa de ferramentas" com todas as operações possíveis.
 */
class DatabaseManager {
    /**
     * EXECUTA UMA CONSULTA SQL
     * 
     * Esta é a função mais importante da classe. Ela executa qualquer
     * comando SQL no banco de dados (SELECT, INSERT, UPDATE, DELETE).
     * 
     * Parâmetros:
     * - text: Comando SQL a ser executado
     * - params: Valores para substituir os $1, $2, etc. no SQL
     * 
     * Retorna: Resultado da consulta (dados encontrados, quantas linhas afetadas, etc.)
     */
    static async query(text, params = []) {
        const start = Date.now(); // Marca o tempo de início
        
        try {
            // Executa a consulta SQL no banco de dados
            const result = await pool.query(text, params);
            
            // Calcula quanto tempo demorou
            const duration = Date.now() - start;
            console.log('Query executada:', { text, duration, rows: result.rowCount });
            
            // Retorna o resultado
            return result;
        } catch (error) {
            console.error('Erro na execução da query:', error);
            throw error; // Re-lança o erro para ser tratado por quem chamou
        }
    }

    /**
     * OBTÉM UMA CONEXÃO DO POOL
     * 
     * Às vezes precisamos de uma conexão específica para operações especiais.
     * Esta função "pega emprestada" uma conexão do pool.
     * 
     * Retorna: Uma conexão que pode ser usada para operações especiais
     */
    static async getClient() {
        return await pool.connect();
    }

    /**
     * INICIA UMA TRANSAÇÃO
     * 
     * Transação é um grupo de operações que devem ser feitas juntas.
     * Se uma falhar, todas são desfeitas (como transferência bancária).
     * 
     * Retorna: Cliente de conexão para usar na transação
     */
    static async beginTransaction() {
        const client = await pool.connect();
        await client.query('BEGIN'); // Inicia a transação
        return client;
    }

    /**
     * CONFIRMA UMA TRANSAÇÃO
     * 
     * Quando todas as operações da transação deram certo,
     * esta função confirma (salva) todas as mudanças.
     * 
     * Parâmetros:
     * - client: Cliente de conexão da transação
     */
    static async commitTransaction(client) {
        await client.query('COMMIT'); // Confirma as mudanças
        client.release(); // Libera a conexão de volta para o pool
    }

    /**
     * DESFAZ UMA TRANSAÇÃO
     * 
     * Se algo deu errado na transação, esta função desfaz
     * todas as mudanças feitas (como se nada tivesse acontecido).
     * 
     * Parâmetros:
     * - client: Cliente de conexão da transação
     */
    static async rollbackTransaction(client) {
        await client.query('ROLLBACK'); // Desfaz as mudanças
        client.release(); // Libera a conexão de volta para o pool
    }

    /**
     * TESTA A CONEXÃO COM O BANCO DE DADOS
     * 
     * Esta função verifica se o sistema consegue se comunicar com o banco.
     * É usada na inicialização do servidor para garantir que tudo está funcionando.
     * 
     * Retorna: true (se conectou) ou false (se não conseguiu conectar)
     */
    static async testConnection() {
        try {
            // Executa uma consulta simples para testar a conexão
            const result = await this.query('SELECT NOW()');
            console.log('Conexão com banco de dados estabelecida:', result.rows[0]);
            return true;
        } catch (error) {
            console.error('Erro ao conectar com banco de dados:', error);
            return false;
        }
    }

    /**
     * FECHA O POOL DE CONEXÕES
     * 
     * Esta função é chamada quando o servidor está sendo desligado.
     * Ela fecha todas as conexões de forma organizada.
     */
    static async close() {
        await pool.end(); // Fecha o pool e todas as conexões
        console.log('Pool de conexões fechado');
    }
}

module.exports = {
    pool,
    DatabaseManager,
    dbConfig
}; 