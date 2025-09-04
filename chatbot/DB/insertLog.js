const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function insertLog(idNum, acao, tabelaAlt, descricao) {
    console.log('insertLog: ', idNum, acao, tabelaAlt, descricao);
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
        `INSERT INTO log (id_numeros, acao, tabela_alterada, descricao) VALUES (?, ?, ?, ?)`,
        [idNum, acao, tabelaAlt, descricao]
        );

        console.log('Resultado do INSERT insertLog:', rows);

        return { success: true };
      } catch (err) {
        console.error('Erro ao inserir log:', err);
        return { success: false };
      } finally {
        await connection.end();
        console.log('Conexão com o banco encerrada.');
      }
}

module.exports = { insertLog };