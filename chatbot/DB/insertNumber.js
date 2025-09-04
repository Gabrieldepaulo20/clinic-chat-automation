const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');
const { insertLog } = require('./insertLog');
const { getNumberByNumber } = require('./getNumberByNumber');

async function insertNumber(numero, etapa) {
    console.log('Inserindo número:', numero);

    let connection;
    try {
        connection = await ConnectDB();
        console.log('Conexão com o banco estabelecida.');
    } catch (err) {
        console.error('Erro ao conectar ao banco "ChatbotBD":', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao conectar ao banco de dados' }),
        };
    }

    const sql = `
        INSERT INTO numeros (numero, ativo, etapa)
        VALUES (?, 1, ?)
    `;

    try {
        await connection.execute(sql, [numero, etapa]);
        console.log('Número inserido com sucesso.');

        const idNum = await getNumberByNumber(numero);
        await insertLog(idNum, 'insert', 'numeros', `Número ${numero} inserido`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Número inserido com sucesso' }),
        };
    } catch (err) {
        console.error('Erro ao inserir número:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao inserir número no banco de dados' }),
        };
    } finally {
        await connection.end();
        console.log('Conexão com o banco encerrada.');
    }
    }

module.exports = { insertNumber };
