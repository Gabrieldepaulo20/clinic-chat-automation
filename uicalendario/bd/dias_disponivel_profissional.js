
const id_profissional = require('./idprofissional.js');

async function diasDisponiveisDoMes(connection, data) {
  const { ano, nomeProfissional, mes } = data;
  const id = await id_profissional(connection, nomeProfissional);
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profissional não encontrado.' })
    };
  }

  const diasDisponiveis = [];
  // Ajuste: passar mes + 1 para obter total de dias
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const dataObj = new Date(dataStr);
    const diaSemana = dataObj.getDay();
    const diaSemanaSql = diaSemana === 0 ? 7 : diaSemana;

    const [horarioPadrao] = await connection.execute(
      `SELECT 1
         FROM horario_padrao_profissional
        WHERE id_profissional = ? AND dia_semana = ? AND ativo = 1
       LIMIT 1`,
      [id, diaSemanaSql]
    );
    if (horarioPadrao.length === 0) continue;

    const [bloqueio] = await connection.execute(
      `SELECT 1
         FROM horarios_atendimentos
        WHERE id_profissional = ? AND data_atendimento = ?
          AND status_disponibilidade IN ('indisponivel','ferias','folga','doente')
       LIMIT 1`,
      [id, dataStr]
    );
    if (bloqueio.length > 0) continue;

    diasDisponiveis.push(dataStr);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(diasDisponiveis)
  };
}

module.exports = diasDisponiveisDoMes;