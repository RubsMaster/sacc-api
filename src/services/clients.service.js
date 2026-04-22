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

export const createClient = async (cliente) => {
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
    .input("fecha_alta", sql.DateTime, new Date())
    .query(`
      INSERT INTO CLIENTE (
        NOMBRE, RFC, TELEFONO_CASA, PAIS, DIRECCION,
        CIUDAD, COLONIA, NUMERO_EXTERIOR, CP, EMAIL,
        USOCFDI, REGIMENFISCAL, FECHA_ALTA
      )
      OUTPUT INSERTED.ID_CLIENTE
      VALUES (
        @nombre, @rfc, @telefono_casa, @pais, @direccion,
        @ciudad, @colonia, @numero_exterior, @cp, @email,
        @usoCFDI, @regimenfiscal, @fecha_alta
      )
    `);

  return result.recordset[0];
};
