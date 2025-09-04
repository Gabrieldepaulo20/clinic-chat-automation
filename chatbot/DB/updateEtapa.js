const { ConnectDB } = require('./ConnectDB');

async function updateEtapa(number, nextMessageId) {
  console.log('updateEtapa - Atualizando etapa do número:', number, 'para:', nextMessageId);

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
      `UPDATE numeros SET etapa = ? WHERE numero = ?`,
      [nextMessageId, number]
    );

    console.log('Resultado do UPDATE:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Etapa atualizada com sucesso' }),
    };    
  } catch (err) {
    console.error('Erro ao executar o UPDATE:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao atualizar etapa', erro: err }),
    };    
  } finally {
    await connection.end();
    console.log('Conexão com o banco encerrada.');
  }
}

module.exports = { updateEtapa };
