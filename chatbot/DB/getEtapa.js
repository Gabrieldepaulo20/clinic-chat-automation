const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function getEtapa(number) {
  console.log('getEtapa - Buscando etapa do número:', number);

  let connection;
  try {
    connection = await ConnectDB();
    console.log('Conexão com o banco estabelecida.');
  } catch (err) {
    console.error('Erro ao conectar ao banco "ChatbotBD":', err);
    return {
      statusCode: 500,
      body: 'Erro ao conectar ao banco de dados',
    };
  }

  const sql = `
    SELECT etapa
    FROM numeros
    WHERE numero = ?
  `;

  try {
    const [rows] = await connection.execute(sql, [number]);

    console.log('Resultado do SELECT getEtapa:', rows);

    if (rows.length > 0) {
      return rows[0];
    } else {
      return { etapa: null };
    }
  } catch (err) {
    console.error('Erro ao buscar etapa:', err);
    return null;
  } finally {
    await connection.end();
    console.log('Conexão com o banco encerrada.');
  }
}

module.exports = { getEtapa };