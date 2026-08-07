import { sql } from "../config/db.js";
import { findProductByID, createProduct } from "./products.service.js";

export const insertSaleRequest = async (
  pool,
  transaction,
  id_cliente,
  folioVenta
) => {
  const result = await pool
    .request(transaction)
    .input("id_cliente", sql.Int, id_cliente)
    .input("usuario", sql.VarChar, "0")
    .input("estado", sql.Char(1), "I")
    .input("comentario", sql.VarChar(300), `Venta Web ${folioVenta}`)
    .input("fecha", sql.DateTime, new Date())
    .input("fecha_captura", sql.DateTime, new Date())
    .input("origen", sql.Char(1), "W")
    .query(`
      INSERT INTO ped_clien (
        id_cliente, usuario, fecha, fecha_captura, estado, comentario, origen
      )
      OUTPUT INSERTED.NO_PEDIDO
      VALUES (
        @id_cliente, @usuario, @fecha, @fecha_captura, @estado, @comentario, @origen
      )
    `);
  return result.recordset[0];
};

export const insertSaleRequestDetails = async (
  pool,
  transaction,
  no_pedido,
  folio_venta,
  producto
) => {  
  let existe = await findProductByID(pool, producto.ID_PRODUCTO);

  if (!existe) {
    existe = await createProduct(pool, transaction, producto);
  }

  return await pool
    .request(transaction)
    .input("id_producto", sql.VarChar, producto.ID_PRODUCTO)
    .input("NO_PEDIDO", sql.Int, no_pedido)
    .input("CANTIDAD_EXISTENCIA", sql.VarChar, "0")
    .input("CANTIDAD_PEDIDA", sql.Float, producto.CANTIDAD)
    .input("CANTIDAD_PENDIENTE", sql.Float, producto.CANTIDAD)
    .query(`
      INSERT INTO PED_CLIEN_DETALLE (
        ID_PRODUCTO, NO_PEDIDO,
        CANTIDAD_EXISTENCIA, CANTIDAD_PEDIDA, CANTIDAD_PENDIENTE
      )
        OUTPUT INSERTED.ID
      VALUES (
        @ID_PRODUCTO, @NO_PEDIDO,
        @CANTIDAD_EXISTENCIA, @CANTIDAD_PEDIDA, @CANTIDAD_PENDIENTE
      )
    `);
};

export const insertRequi = async (
  pool,
  transaction,
  producto,
  comentario
) => {
  await pool
    .request(transaction)
    .input("id_producto", sql.VarChar(), producto.ID_PRODUCTO)
    .input("descripcion", sql.VarChar(500), producto.DESCRIPCION)
    .input("marca", sql.VarChar(50), producto.MARCA)
    .input("activo", sql.Char(1), "0")
    .input("contador", sql.Int, 0)
    .input("cotizada", sql.Char(1), "0")
    .input("folio", sql.Int, 0)
    .input("urgente", sql.VarChar(1), "S")
    .input("fecha", sql.DateTime, new Date())
    .input("cantidad", sql.Float, producto.CANTIDAD)
    .input("comentario", sql.VarChar(500), comentario)
    .query(`
      INSERT INTO REQUISICION (
        id_producto, descripcion, marca, activo,
        contador, cotizada, folio, urgente, fecha,
        cantidad, comentario
      )
      VALUES (
        @id_producto, @descripcion, @marca, @activo,
        @contador, @cotizada, @folio, @urgente, @fecha,
        @cantidad, @comentario
      )
    `);
};

export const getClientSales = async (pool, id) => {
  const result = await pool
    .request()
    .input("id_cliente", sql.Int, id)
    .query(`
      SELECT
        V.ID_VENTA,
        V.ID_CLIENTE,
        V.NOMBRE,
        V.SUBTOTAL,
        V.IVA,
        V.TOTAL,
        V.FECHA,
        TRIM(V.FORMA_PAGO) AS FORMA_PAGO,
        V.UNA_EXIBICION,
        V.PARCIALIDADES,
        TRIM(V.SUCURSAL) as SUCURSAL,
        V.DIAS_CREDITO,
        V.FECHA_VENCE,
        V.TIPO_PAGO,
        V.COMENTARIO,
        V.FormaPagoSAT,
        C.DEUDA
      FROM VENTAS V
      LEFT JOIN CUENTAS C ON V.ID_VENTA = C.ID_VENTA
      WHERE V.id_cliente = @id_cliente
    `);

  return result.recordset ?? null;
};
