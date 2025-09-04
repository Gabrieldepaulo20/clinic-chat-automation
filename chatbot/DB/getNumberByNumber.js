const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function getNumberByNumber(number) {
    console.log('getNumberByNumber: ', number);
    let connection;

    try {
        connection = await ConnectDB();
        //console.log('Conexão com o banco estabelecida.');
    } catch (err) {
        console.error('Erro ao conectar ao banco "ChatbotBD":', err);
        return {
        statusCode: 500,
        body: JSON.stringify({message: 'Erro ao conectar ao banco de dados'}),
        };
    }

    try {
        const [rows] = await connection.execute(
        `SELECT * FROM numeros WHERE numero = ?`,
        [number]
        );

        console.log('Resultado do SELECT getNumberByNumber:', rows);
  
        if (rows.length > 0) {
          return rows[0];
        } else {
          return {
            id: null,
            numero: null,
            etapa: null,
            ativo: null
          };
        }
      } catch (err) {
        console.error('Erro ao buscar o número:', err);
        return {
          id: null,
          numero: null,
          etapa: null,
          ativo: null
        };
      } finally {
        await connection.end();
        console.log('Conexão com o banco encerrada.');
      }
}

module.exports = { getNumberByNumber };