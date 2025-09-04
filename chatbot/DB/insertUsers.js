const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

function capitalizeWords(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function insertUsers(nome, cpf, celular, ativo) {
    nome = capitalizeWords(nome);
    console.log('Inserindo usuário:', nome, cpf, celular, ativo);


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
        INSERT INTO usuarios (nome, cpf, celular, ativo)
        VALUES (?, ?, ?, ?)
    `;

    const values = [nome, cpf, celular, ativo];
    console.log('Valores a serem inseridos:', values);

    try {
        await connection.execute(sql, values);
        console.log('Usuário inserido com sucesso.');
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Usuário inserido com sucesso.' }),
        };  
    } catch (err) {
        console.error('Erro ao inserir usuário:', err);
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Erro ao inserir usuário:', erro: err }),
        };  
    } finally {
        await connection.end();
    }
}

module.exports = { insertUsers };
