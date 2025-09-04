const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function getUserAtive(idNumber) {
  console.log('getUserAtive: ', idNumber);
  let connection;

  try {
      connection = await ConnectDB();
      //console.log('Conexão com o banco estabelecida.');
  } catch (err) {
      console.error('Erro ao conectar ao banco "ChatbotBD":', err);
      return {
      statusCode: 500,
      body: 'Erro ao conectar ao banco de dados',
      };
  }

  const sql = `
    SELECT id_usuario
    FROM usuarios
    WHERE celular = ?
    AND ativo = 1
  `;

  try {
    const [rows] = await connection.execute(sql, [idNumber]);

    console.log('Resultado do SELECT getUserAtive:', rows);

    if (rows.length > 0) {
      return rows[0];
    } else {
      return {id_usuario: null}
    }
  } catch (err) {
    console.error('Erro ao buscar usuário pelo Numero:', err);
    return {id_usuario: null}
  } finally {
    await connection.end();
    console.log('Conexão com o banco encerrada.');
  }
}

module.exports = { getUserAtive };