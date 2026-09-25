const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do Pool de conexões com o MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mata_mosquito_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão ao inicializar a aplicação
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o banco MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao banco de dados MySQL:', err.message);
    });

module.exports = pool;