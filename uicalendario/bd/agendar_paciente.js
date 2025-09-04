const idProfissional = require('./idprofissional.js');

async function agendarPaciente(connection, data) {
  const {
    email,
    id_usuario,
    nomeProfissional,
    data_agendamento,
    horarioSelecionado,
    tipo_consulta,
    observacoes = ''
  } = data;

  const id_profissional = await idProfissional(connection, nomeProfissional);

  if (!email || !id_usuario || !id_profissional || !data_agendamento || !tipo_consulta) {
    return {
      statusCode: 400,
      body: JSON.stringify({ erro: "Preencha todos os campos obrigatórios." })
    };
  }
  const datetimeAgendamento = `${data_agendamento} ${horarioSelecionado}:00`;
  await connection.execute(
    `UPDATE usuarios
        SET email = ?
      WHERE id_usuario = ?`,
    [email, id_usuario]
  );

  await connection.execute(
    `INSERT INTO agendamentos
      (id_usuario, id_profissional, data_agendamento, tipo_consulta, observacoes)
      VALUES (?, ?, ?, ?, ?)`,
    [id_usuario, id_profissional, datetimeAgendamento, tipo_consulta, observacoes]
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ mensagem: "Agendamento realizado com sucesso." })
  };
}

module.exports = agendarPaciente;