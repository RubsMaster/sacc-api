import { getConnection, sql } from "../config/db.js";

// ---------- FUNCIÓN AUXILIAR PARA FORMATEAR TELÉFONO ----------
const formatPhoneNumber = (raw) => {
  if (!raw) return '';
  // Extraer solo dígitos
  const digits = raw.replace(/\D/g, '');
  // Formato mexicano a 10 dígitos: 123-456-7890
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // Si no tiene 10 dígitos, devolver solo los dígitos (o cadena vacía si ninguno)
  return digits;
};

// ---------- FUNCIONES DEL MODELO ----------
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
    .input("id", sql.Int, id)
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
        ISNULL(Deudas.TotalDeuda, 0) AS deuda_actual,
        (c.LIMITE_CREDITO - ISNULL(Deudas.TotalDeuda, 0)) AS credito_disponible,
        c.direccion,
        c.colonia,
        c.numero_exterior,
        c.cp,
        c.ciudad,
        c.estado,
        c.pais
      FROM cliente c
      LEFT JOIN (
        SELECT id_cliente, SUM(deuda) AS TotalDeuda 
        FROM cuentas 
        GROUP BY id_cliente
      ) Deudas ON c.id_cliente = Deudas.id_cliente
    `);

  const client = result.recordset[0];
  if (!client) return null;

  return {
    ...client,
    telefono_casa: formatPhoneNumber(client.telefono_casa),
    cp: client.cp ? client.cp.trim() : '',
    numero_exterior: client.numero_exterior ? client.numero_exterior.trim() : ''
  };
};

export const getClientCreditByID = async (id) => {
  const pool = await getConnection();
  // NOTA: Esta consulta es propensa a inyección SQL. Se recomienda usar parámetros.
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
      c.email,
      c.LIMITE_CREDITO,
      ISNULL(Deudas.TotalDeuda, 0) AS deuda_actual,
      (c.LIMITE_CREDITO - ISNULL(Deudas.TotalDeuda, 0)) AS credito_disponible,
      c.direccion,
      c.colonia,
      c.numero_exterior,
      c.cp,
      c.ciudad,
      c.estado,
      c.pais
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

  return result.recordset.map(client => ({
    ...client,
    telefono_casa: formatPhoneNumber(client.telefono_casa),
    cp: client.cp ? client.cp.trim() : '',
    numero_exterior: client.numero_exterior ? client.numero_exterior.trim() : ''
  }));
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