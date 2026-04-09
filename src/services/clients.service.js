import { getConnection, sql } from '../config/db.js';

export const findClientByRfc = async (rfc) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('rfc', sql.VarChar, rfc)
    .query('SELECT id_cliente as ID, Nombre, RFC FROM cliente WHERE RFC = @rfc'); 
  
  return result.recordset[0];
};

export const getClientsCredit = async () => {
  const pool = await getConnection();
  
  const query = `
    SELECT 
      c.id_cliente, 
      c.nombre, 
      c.rfc, 
      c.telefono_casa, 
      c.dias_credito, 
      c.usocfdi, 
      c.regimenfiscal,
      c.LIMITE_CREDITO,
      ISNULL(Deudas.TotalDeuda, 0) AS deuda_actual,
      (c.LIMITE_CREDITO - ISNULL(Deudas.TotalDeuda, 0)) AS credito_disponible
    FROM cliente c
    LEFT JOIN (
      SELECT id_cliente, SUM(deuda) AS TotalDeuda 
      FROM cuentas 
      GROUP BY id_cliente
    ) Deudas ON c.id_cliente = Deudas.id_cliente
    WHERE c.LIMITE_CREDITO > 0 
      AND c.dias_credito > 0
  `;

  const result = await pool.request().query(query);
  
  return result.recordset;
};