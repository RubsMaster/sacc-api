import { getConnection, sql } from '../config/db.js';

export const findClientByRfc = async (rfc) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('rfc', sql.VarChar, rfc)
    .query('SELECT id_cliente as ID, Nombre, RFC FROM cliente WHERE RFC = @rfc'); 
  
  return result.recordset[0];
};
