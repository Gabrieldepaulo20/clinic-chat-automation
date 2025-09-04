async function getProfissionais(connection) {
    const [rows] = await connection.execute(
      `SELECT p.id_profissional, u.nome
       FROM profissionais p
       LEFT JOIN usuarios u
         ON u.id_usuario = p.id_usuario`
    );
    return rows.map(r => r.nome); 
  }
  
  module.exports = getProfissionais;