import { getConnection, sql } from "../config/db.js";

export const findClientByRfc = async (rfc) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("rfc", sql.VarChar, rfc)
    .query(
      "SELECT id_cliente as ID, Nombre, RFC FROM cliente WHERE RFC = @rfc",
    );

  return result.recordset[0];
};

export const findClientByID = async (id) => {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("id_cliente", sql.Int, id)
    .query(`
      SELECT 
        c.id_cliente, 
        c.nombre, 
        c.rfc, 
        c.telefono_casa, 
        c.dias_credito, 
        c.usocfdi, 
        c.regimenfiscal,
        c.email,
        c.LIMITE_CREDITO,
        ISNULL((
          SELECT SUM(deuda) 
          FROM cuentas 
          WHERE id_cliente = c.id_cliente   -- solo calcula para este cliente
        ), 0) AS deuda_actual,
        c.LIMITE_CREDITO - ISNULL((
          SELECT SUM(deuda) 
          FROM cuentas 
          WHERE id_cliente = c.id_cliente
        ), 0) AS credito_disponible
      FROM cliente c
      WHERE c.id_cliente = @id_cliente
    `);

  return result.recordset[0] ?? null;
};

export const getClientCreditByID = async (id) => {
  const pool = await getConnection();
  const query = `
    SELECT 
      c.id_cliente as ID, 
      c.nombre, 
      c.rfc, 
      c.dias_credito,
      c.email,
      c.LIMITE_CREDITO
    FROM cliente c
    WHERE c.ID_CLIENTE = ${id}
  `;
  const result = await pool.request().query(query);
  return result.recordset[0];
}

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
      c.email,
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
      AND c.VALORACION = 'A'
	    AND (c.EMAIL is not null)
  `;

  const result = await pool.request().query(query);

  return result.recordset;
};

export const createClient = async (cliente) => {
  const hoy = new Date();

  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const anio = hoy.getFullYear();

  const fecha = `${dia}/${mes}/${anio}`;

  const pool = await getConnection();
  const result = await pool
    .request()
    .input("nombre", sql.VarChar, cliente.nombre)
    .input("rfc", sql.VarChar, cliente.rfc)
    .input("telefono_casa", sql.VarChar, cliente.telefono_casa)
    .input("pais", sql.VarChar, cliente.pais)
    .input("direccion", sql.VarChar, cliente.direccion)
    .input("ciudad", sql.VarChar, cliente.ciudad)
    .input("colonia", sql.VarChar, cliente.colonia)
    .input("numero_exterior", sql.Char, cliente.numero_exterior)
    .input("cp", sql.Char, cliente.cp)
    .input("email", sql.VarChar, cliente.email)
    .input("usoCFDI", sql.VarChar, cliente.usoCFDI)
    .input("regimenfiscal", sql.VarChar, cliente.regimenfiscal)
    .input("fecha_alta", sql.VarChar, fecha)
    .query(`
      INSERT INTO CLIENTE (
        NOMBRE, RFC, TELEFONO_CASA, PAIS, DIRECCION,
        CIUDAD, COLONIA, NUMERO_EXTERIOR, CP, EMAIL,
        USOCFDI, REGIMENFISCAL, FECHA_ALTA
      )
      OUTPUT INSERTED.ID_CLIENTE
      VALUES (
        UPPER(@nombre), UPPER(@rfc), @telefono_casa, UPPER(@pais),
        UPPER(@direccion), UPPER(@ciudad), UPPER(@colonia),
        @numero_exterior, @cp, @email,
        UPPER(@usoCFDI), UPPER(@regimenfiscal), @fecha_alta
      )
    `);

  return result.recordset[0];
};
