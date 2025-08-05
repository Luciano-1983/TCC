/**
 * Arquivo de configuração do banco de dados (Legacy)
 * 
 * NOTA: Este arquivo foi mantido para compatibilidade com código existente.
 * Para novos desenvolvimentos, use o DatabaseManager em config/database.js
 * 
 * @deprecated Use config/database.js instead
 */

const { pool } = require('./config/database');

// Exporta o pool para compatibilidade com código existente
module.exports = pool;
