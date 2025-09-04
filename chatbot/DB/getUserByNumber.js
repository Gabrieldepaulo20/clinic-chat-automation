const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

async function getUserByNumber(idNumber) {
  console.log('getUserByNumber: ', idNumber);
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
    SELECT *
    FROM usuarios
    WHERE celular = ?
  `;

  try {
    const [rows] = await connection.execute(sql, [idNumber]);

    console.log('Resultado do SELECT getUserByNumber:', rows);

    if (rows.length > 0) {
      return rows[0];
    } else {
      return {
        id_usuario: null,
        nome: null,
        cpf: null,
        data_nascimento: null,
        rua: null,
        numero: null,
        bairro: null,
        cidade: null,
        estado: null,
        cep: null,
        telefone: null,
        celular: null,
        email: null,
        ativo: null,
      };
    }
  } catch (err) {
    console.error('Erro ao buscar usuário pelo Numero:', err);
    return {
      id_usuario: null,
      nome: null,
      cpf: null,
      data_nascimento: null,
      rua: null,
      numero: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
      telefone: null,
      celular: null,
      email: null,
      ativo: null,
    };
  } finally {
    await connection.end();
    console.log('Conexão com o banco encerrada.');
  }
}

module.exports = { getUserByNumber };