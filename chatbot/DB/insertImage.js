const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function insertImage(nome, url, tipo, usuarioId, descricao) {
    console.log('Inserindo imagem:', { nome, url, tipo, usuarioId, descricao });

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
        INSERT INTO imagens (nome, image_url, tipo, usuario_id, descricao)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        await connection.execute(sql, [nome, url, tipo, usuarioId, descricao]);
        console.log('imagem inserido com sucesso.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'imagem inserida com sucesso' }),
        };
    } catch (err) {
        console.error('Erro ao inserir imagem:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao inserir imagem no banco de dados' }),
        };
    } finally {
        await connection.end();
        console.log('Conexão com o banco encerrada.');
    }
    }

module.exports = { insertImage };
