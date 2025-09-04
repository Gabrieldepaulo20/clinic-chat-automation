async function idProfissional(connection, nomeProfissional) {
  nomeProfissional = (nomeProfissional || '').trim();
  if (!nomeProfissional) return null;

  const [rows] = await connection.execute(
    `SELECT p.id_profissional
       FROM profissionais p
       JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE LOWER(TRIM(u.nome)) = LOWER(?)
      LIMIT 1`,
    [nomeProfissional]
  );

  console.log('[idProfissional] resultado da query:', rows);
  return rows.length ? rows[0].id_profissional : null;
}

module.exports = idProfissional;