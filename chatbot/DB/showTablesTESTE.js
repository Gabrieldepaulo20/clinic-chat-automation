const mysql = require('mysql2/promise');

async function showTablesTESTE() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,     
    user: process.env.DB_USER,     
    password: process.env.DB_PASS,
    database: 'ChatbotBD',
  });


    const [rows] = await connection.execute(`
    SELECT * FROM numeros;
    `);

    // //const [rows] = 
    // await connection.execute(`
    // DELETE FROM usuarios;
    // `);

    // const [rows] = await connection.execute(`
    // DELETE FROM numeros;
    // `);

    // const [rows] = await connection.execute(`
    // SHOW TABLES;
    // `);

  //   const [rows] = await connection.execute(`
  //   SELECT 
  //     COLUMN_NAME,
  //     DATA_TYPE,
  //     IS_NULLABLE,
  //     COLUMN_KEY,
  //     COLUMN_DEFAULT,
  //     EXTRA
  //   FROM INFORMATION_SCHEMA.COLUMNS
  //   WHERE TABLE_NAME = ?
  //     AND TABLE_SCHEMA = 'ChatbotBD'
  //   ORDER BY ORDINAL_POSITION;
  // `, ['numeros']);

  // await connection.execute(`
  // ALTER TABLE numeros DROP FOREIGN KEY fk_numeros_usuario;
  // `)
  // await connection.execute(`
  // ALTER TABLE numeros DROP COLUMN usuario_id;
  // `)

// const [rows] = await connection.execute(`
//   ALTER TABLE usuarios
//   MODIFY celular INT, -- ajusta tipo para int
//   ADD CONSTRAINT fk_usuarios_celular
//   FOREIGN KEY (celular) REFERENCES numeros(id);
//   `,);

  console.log('Usuarios: ',rows);
  await connection.end();

  return rows;
}

module.exports = { showTablesTESTE };
