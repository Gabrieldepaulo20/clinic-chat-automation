const mysql = require('mysql2/promise');
const { ConnectDB } = require('./ConnectDB');

function capitalizeWords(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function updateUser(number, value, field) {
      
    if (field == 'nome'){
      value = capitalizeWords(value);
    }

    console.log('updateUser - Atualizando usuário:', number, 'Campo:', field, 'Valor:', value);

    // Campos que podem ser atualizados
    const camposPermitidos = ['nome', 'cpf', 'data_nascimento', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'telefone', 'celular', 'email'];
    if (!camposPermitidos.includes(field)) {
      console.error('Campo de atualização inválido:', field);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Campo inválido para atualização' }),
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
          `UPDATE usuarios SET ${field} = ? WHERE celular = ? AND (${field} IS NULL OR ${field} = '') AND ativo = 1`,
          [value, number]
        );
    
        console.log('Resultado do UPDATE:', result);
    
        if (result.affectedRows === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Campo '${field}' já preenchido. Nenhuma alteração feita.` })
        };
        }
    
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Usuário atualizado com sucesso' })
        };
      } catch (err) {
        console.error('Erro ao executar o UPDATE:', err);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Erro ao atualizar usuário' })
        };
      } finally {
        await connection.end();
        console.log('Conexão com o banco encerrada.');
      }
}

module.exports = { updateUser };