const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function getMessageByName(name) {
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
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM mensagens WHERE nome_mensagem = ?',
        [name]
      );
  
      console.log('Resultado do SELECT getMessageByName:', rows);
  
      if (rows.length > 0) {
        return rows[0];
      } else {
        return {
          id_mensagens: null,
          nome_mensagem: null,
          tipo: null,
          proxima_mensagem_id: null,
          caminho: null
        };
      }
    } catch (err) {
      console.error('Erro ao buscar mensagem pelo nome:', err);
      return {
        id_mensagens: null,
        nome_mensagem: null,
        tipo: null,
        proxima_mensagem_id: null,
        caminho: null
      };
    } finally {
      await connection.end();
      console.log('Conexão com o banco encerrada.');
    }
}

module.exports = { getMessageByName };