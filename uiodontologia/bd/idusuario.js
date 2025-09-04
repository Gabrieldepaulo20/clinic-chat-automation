async function buscarIdUsuario(connection, data) {
    const { nomeUsuario } = data;
    const sql = `
      SELECT id_usuario 
      FROM usuarios 
      WHERE nome = ?
      LIMIT 1
    `;
    const [rows] = await connection.execute(sql, [nomeUsuario]);
  
    if (!rows || rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Usuário não encontrado.' })
      };
    }
      const { id_usuario } = rows[0];
  
    return {
      statusCode: 200,
      body: JSON.stringify({ id_usuario })
    };
  }
  
  module.exports = buscarIdUsuario;