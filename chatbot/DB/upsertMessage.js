const { ConnectDB } = require('./ConnectDB');

async function upsertMessage({ nome_mensagem, caminho, tipo, proxima_mensagem_id }) {
  const connection = await ConnectDB();

  try {
    const [existing] = await connection.execute(
      'SELECT id_mensagens FROM mensagens WHERE nome_mensagem = ?',
      [nome_mensagem]
    );

    if (existing.length > 0) {
      // Mensagem já existe -> Atualizar
      await connection.execute(
        'UPDATE mensagens SET caminho = ?, tipo = ?, proxima_mensagem_id = ? WHERE nome_mensagem = ?',
        [caminho, tipo, proxima_mensagem_id, nome_mensagem]
      );
      console.log(`Mensagem atualizada: ${nome_mensagem}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Mensagem atualizada: ${nome_mensagem}` }),
      };  
    } else {
      // Mensagem não existe -> Inserir
      await connection.execute(
        'INSERT INTO mensagens (nome_mensagem, caminho, tipo, proxima_mensagem_id) VALUES (?, ?, ?, ?)',
        [nome_mensagem, caminho, tipo, proxima_mensagem_id]
      );
      console.log(`✅ Mensagem inserida: ${nome_mensagem}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Mensagem inserida: ${nome_mensagem}` }),
      };  
    }

  } catch (error) {
    console.error(`❌ Erro no upsert da mensagem '${nome_mensagem}':`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Erro no upsert da mensagem '${nome_mensagem}'`, erro: error }),
    };  
  } finally {
    await connection.end();
  }
}

module.exports = { upsertMessage };