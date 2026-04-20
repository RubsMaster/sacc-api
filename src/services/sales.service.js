import { getConnection, sql } from "../config/db.js";
import { findProductByID, createProduct } from "./products.service.js";

export const insertSale = async (
  pool,
  transaction,
  { id_cliente, nombre, subtotal, iva, total },
) => {
  const result = await pool
    .request(transaction)
    .input("id_cliente", sql.Int, id_cliente)
    .input("nombre", sql.VarChar, nombre)
    .input("subtotal", sql.Float, subtotal)
    .input("iva", sql.Float, iva)
    .input("total", sql.Float, total)
    .input("descuento", sql.Decimal(10, 2), 0)
    .input("fecha", sql.DateTime, new Date())
    .input("id_usuario", sql.Int, 0)
    .input("forma_pago", sql.VarChar, "PAGO EN UNA SOLA EXHIBICION")
    .input("una_exibicion", sql.Char, "S")
    .input("sucursal", sql.Char, "BODEGA")
    .input("dias_credito", sql.Int, 0)
    .input("facturado", sql.Char, "0")
    .input("impuesto1", sql.Decimal(10, 2), 0)
    .input("impuesto2", sql.Decimal(10, 2), 0)
    .input("retencion", sql.Decimal(10, 2), 0)
    .input("formapagosat", sql.VarChar, "099")
    .input("entregado", sql.Char, "N").query(`
      INSERT INTO Ventas (
        id_cliente, nombre, subtotal, iva, total, descuento, fecha,
        id_usuario, forma_pago, una_exibicion, sucursal, dias_credito,
        facturado, impuesto1, impuesto2, retencion, formapagosat, entregado
      ) 
      OUTPUT INSERTED.id_venta
      VALUES (
        @id_cliente, @nombre, @subtotal, @iva, @total, @descuento, @fecha,
        @id_usuario, @forma_pago, @una_exibicion, @sucursal, @dias_credito,
        @facturado, @impuesto1, @impuesto2, @retencion, @formapagosat, @entregado
      )
    `);

  return result.recordset[0];
};

export const insertSaleDetails = async (
  pool,
  transaction,
  id_venta,
  productos,
) => {
  for (const producto of productos) {
    let existe = await findProductByID(producto.ID_PRODUCTO);

    if (!existe) {
      existe = await createProduct(pool, transaction, producto);
    }

    await pool
      .request(transaction)
      .input("id_venta", sql.Int, id_venta)
      .input("id_producto", sql.VarChar, producto.ID_PRODUCTO)
      .input("descripcion", sql.VarChar, producto.DESCRIPCION)
      .input("cantidad", sql.Float, producto.CANTIDAD)
      .input("precio_venta", sql.Float, producto.PRECIO_VENTA)
      .input("precio_costo", sql.Float, producto.PRECIO_COSTO)
      .input("ganancia", sql.Float, producto.PORCENAJE_GANANCIA)
      .input("importe", sql.Float, producto.IMPORTE)
      .input("iva", sql.Float, producto.IVA)
      .input("impuesto1", sql.Decimal(10, 2), 0)
      .input("impuesto2", sql.Decimal(10, 2), 0)
      .input("retencion", sql.Decimal(10, 2), 0).query(`
        INSERT INTO VENTAS_DETALLE (
          ID_VENTA, ID_PRODUCTO, DESCRIPCION, CANTIDAD, PRECIO_VENTA,
          PRECIO_COSTO, GANANCIA, IMPORTE, IVA, IMPUESTO1, IMPUESTO2, RETENCION
        )
      VALUES (@id_venta, @id_producto, @descripcion, @cantidad, @precio_venta, @precio_costo, @ganancia, @importe, @iva, @impuesto1, @impuesto2, @retencion)
      `);
  }
};
