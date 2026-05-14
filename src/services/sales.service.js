import { getConnection, sql } from "../config/db.js";
import { findProductByID, createProduct } from "./products.service.js";

export const insertSale = async (
  pool,
  transaction,
  { id_cliente, nombre, subtotal, iva, total, credito, dias },
) => {
  const formaPago = credito ? "PAGO EN PARCIALIDADES" : "PAGO EN UNA SOLA EXHIBICION";
  const unaExhibicion = credito ? "N" : "S"
  const dias_credito = dias || 0
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
    .input("forma_pago", sql.VarChar, formaPago)
    .input("una_exibicion", sql.Char, unaExhibicion)
    .input("dias_credito", sql.Int, dias_credito)
    .input("sucursal", sql.Char, "BODEGA")
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
      .input("retencion", sql.Decimal(10, 2), 0)
      .query(`
        INSERT INTO VENTAS_DETALLE (
          ID_VENTA, ID_PRODUCTO, DESCRIPCION, CANTIDAD, PRECIO_VENTA,
          PRECIO_COSTO, GANANCIA, IMPORTE, IVA, IMPUESTO1, IMPUESTO2, RETENCION
        )
        VALUES (
          @id_venta, @id_producto, @descripcion, @cantidad, @precio_venta,
          @precio_costo, @ganancia, @importe, @iva, @impuesto1, @impuesto2, @retencion
        )
      `);
  }
};

export const insertDebt = async (
  pool,
  transaction,
  id_venta,
  id_cliente,
  total,
  dias
) => {
  const fechaHoy = new Date()
  const fechaVence = new Date(fechaHoy)
  fechaVence.setDate(fechaVence.getDate() + (Number(dias) || 0))

  const cuenta = await pool
    .request(transaction)
    .input("id_venta", sql.Int, id_venta)
    .input("id_cliente", sql.Int, id_cliente)
    .input("id_usuario", sql.Int, 0)
    .input("deuda", sql.Float, total)
    .input("dias_credito", sql.Int, dias)
    .input("fecha", sql.DateTime, new Date())
    .input("fecha_vence", sql.DateTime, fechaVence)
    .input("descuento", sql.Float, 0)
    .input("total_compra", sql.Float, total)
    .input("sucursal", sql.Char(15), "BODEGA")
    .input("pagada", sql.Char(1), "N")
    .query(`
      INSERT INTO CUENTAS (
        id_venta, id_cliente, id_usuario, fecha, dias_credito,
        fecha_vence, descuento, total_compra, sucursal, pagada, deuda
      )
      OUTPUT INSERTED.id_cuenta
      VALUES (
        @id_venta, @id_cliente, @id_usuario, @fecha, @dias_credito,
        @fecha_vence, @descuento, @total_compra, @sucursal, @pagada, @deuda
      )
    `);
    const id_cuenta = cuenta.recordset[0].id_cuenta;
    const cuentaVenta = await pool
      .request(transaction)
      .input("id_venta", sql.Int, id_venta)
      .input("id_cuenta", sql.Int, id_cuenta)
      .query(`
      INSERT INTO cuenta_venta (
          id_venta, id_cuenta
        )
        VALUES (
          @id_venta, @id_cuenta
        )
      `);
}

export const getClientSales = async (id) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id_cliente", sql.Int, id)
    .query(`
      select  
        ID_VENTA,
        ID_CLIENTE,
        NOMBRE,
        SUBTOTAL,
        IVA,
        TOTAL,
        FECHA,
        TRIM(FORMA_PAGO) AS FORMA_PAGO,
        UNA_EXIBICION,
        PARCIALIDADES,
        trim(SUCURSAL) as SUCURSAL,
        DIAS_CREDITO,
        FECHA_VENCE,
        TIPO_PAGO,
        COMENTARIO,
        FormaPagoSAT
      from ventas 
      where id_cliente = @id_cliente  
    `);

  return result.recordset ?? null;
}