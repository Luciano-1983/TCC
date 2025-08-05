/**
 * Configuração do banco de dados PostgreSQL
 * Segue o princípio de Inversão de Dependência (DIP) do SOLID
 * Centraliza todas as configurações de banco de dados
 */

const { Pool } = require('pg');

/**
 * Configurações do banco de dados
 * Em produção, estas variáveis devem vir de variáveis de ambiente
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'caregiver_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'nova_senha',
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
    connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
};

/**
 * Pool de conexões do PostgreSQL
 * Reutiliza conexões para melhor performance
 */
const pool = new Pool(dbConfig);

/**
 * Event listener para erros de conexão
 */
pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
    process.exit(-1);
});

/**
 * Event listener para quando uma conexão é criada
 */
pool.on('connect', () => {
    console.log('Nova conexão criada no pool de banco de dados');
});

/**
 * Classe para gerenciar conexões com o banco de dados
 */
class DatabaseManager {
    /**
     * Executa uma query no banco de dados
     * @param {string} text - Query SQL
     * @param {Array} params - Parâmetros da query
     * @returns {Promise<Object>} Resultado da query
     */
    static async query(text, params = []) {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Query executada:', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            console.error('Erro na execução da query:', error);
            throw error;
        }
    }

    /**
     * Obtém uma conexão do pool
     * @returns {Promise<Object>} Cliente de conexão
     */
    static async getClient() {
        return await pool.connect();
    }

    /**
     * Inicia uma transação
     * @returns {Promise<Object>} Cliente de transação
     */
    static async beginTransaction() {
        const client = await pool.connect();
        await client.query('BEGIN');
        return client;
    }

    /**
     * Confirma uma transação
     * @param {Object} client - Cliente de transação
     */
    static async commitTransaction(client) {
        await client.query('COMMIT');
        client.release();
    }

    /**
     * Reverte uma transação
     * @param {Object} client - Cliente de transação
     */
    static async rollbackTransaction(client) {
        await client.query('ROLLBACK');
        client.release();
    }

    /**
     * Testa a conexão com o banco de dados
     * @returns {Promise<boolean>} True se conectado, false caso contrário
     */
    static async testConnection() {
        try {
            const result = await this.query('SELECT NOW()');
            console.log('Conexão com banco de dados estabelecida:', result.rows[0]);
            return true;
        } catch (error) {
            console.error('Erro ao conectar com banco de dados:', error);
            return false;
        }
    }

    /**
     * Fecha o pool de conexões
     */
    static async close() {
        await pool.end();
        console.log('Pool de conexões fechado');
    }
}

module.exports = {
    pool,
    DatabaseManager,
    dbConfig
}; 