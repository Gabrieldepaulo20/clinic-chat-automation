const { ConnectDB } = require('./ConnectDB');

async function updateStatus(valor, status, field, statusAtual) {
  console.log(`updateStatus - Atualizando status do ${field}`, valor, ' de', statusAtual, ' para:', status);

  if (!['cpf', 'celular'].includes(field)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Campo inválido para update' }),
    };
  }  
  
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
    const [result] = await connection.execute(
      `UPDATE usuarios SET ativo = ? WHERE ${field} = ? AND ativo = ?`,
      [status, valor, statusAtual]
    );

    console.log('Resultado do UPDATE:', result);

    return {
      statusCode: 200,
      body: 'Etapa atualizada com sucesso',
    };
  } catch (err) {
    console.error('Erro ao executar o UPDATE:', err);
    return {
      statusCode: 500,
      body: 'Erro ao atualizar etapa',
    };
  } finally {
    await connection.end();
    console.log('Conexão com o banco encerrada.');
  }
}

module.exports = { updateStatus };
