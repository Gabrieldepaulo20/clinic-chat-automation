const idProfissional = require('./idprofissional.js');

async function buscarHorariosDisponiveis(connection, data) {
  const { dataSelecionada, nomeProfissional } = data;

  const id = await idProfissional(connection, nomeProfissional);
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profissional não encontrado.' })
    };
  }

  // 1. Descobre o dia da semana da dataSelecionada
  const dataObj = new Date(dataSelecionada);
  const diaSemana = dataObj.getDay();
  const diaSemanaSql = diaSemana === 0 ? 7 : diaSemana;

  // Busca horário padrão para o dia da semana
  const [padraoRows] = await connection.execute(
    `SELECT hora_inicio, hora_fim
       FROM horario_padrao_profissional
      WHERE id_profissional = ? AND dia_semana = ?`,
    [id, diaSemanaSql]
  );

  if (padraoRows.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ horariosDisponiveis: [] })
    };
  }

  const horaInicio = padraoRows[0].hora_inicio;
  const horaFim = padraoRows[0].hora_fim;

  // Busca bloqueios/indisponibilidades na data
  const [bloqueiosRows] = await connection.execute(
    `SELECT hora_inicio, hora_fim FROM horarios_atendimentos
      WHERE id_profissional = ? AND data_atendimento = ?
        AND status_disponibilidade IN ('indisponivel','ferias','folga','doente')`,
    [id, dataSelecionada]
  );

  // Busca agendamentos do dia selecionado
  const [agendadosRows] = await connection.execute(
    `SELECT TIME(data_agendamento) AS horario 
       FROM agendamentos
      WHERE id_profissional = ? 
        AND DATE(data_agendamento) = ?`,
    [id, dataSelecionada]
  );

  function gerarHorariosDisponiveis(inicio, fim, bloqueios, agendados) {
    const horarios = [];
    let atual = new Date(`${dataSelecionada}T${inicio}`);
    const limite = new Date(`${dataSelecionada}T${fim}`);

    while (atual < limite) {
      const horarioStr = atual.toTimeString().slice(0, 5);

      const emBloqueio = bloqueios.some(bloqueio => {
        const bIni = new Date(`${dataSelecionada}T${bloqueio.hora_inicio}`);
        const bFim = new Date(`${dataSelecionada}T${bloqueio.hora_fim}`);
        return atual >= bIni && atual < bFim;
      });

      const agendado = agendados.some(a => a.horario.slice(0,5) === horarioStr);

      if (!emBloqueio && !agendado) {
        horarios.push(horarioStr);
      }
      atual = new Date(atual.getTime() + 15 * 60000);
    }
    return horarios;
  }

  const horariosDisponiveis = gerarHorariosDisponiveis(
    horaInicio, horaFim, bloqueiosRows, agendadosRows
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ horariosDisponiveis })
  };
}

module.exports = buscarHorariosDisponiveis;