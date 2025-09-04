const mysql = require('mysql2/promise');

async function ConnectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: 'ChatbotBD',
    });

    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return connection;

  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    throw err;
  }
}

module.exports = ConnectDB;