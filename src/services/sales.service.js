import { getConnection, sql } from '../config/db.js';

export const insertSaleWithDetails = async (saleData, productos) => {
  const { id_cliente, nombre, subtotal, iva, total } = saleData;
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  let transactionStarted = false;

  try {
    await transaction.begin();
    transactionStarted = true;

    const requestVenta = new sql.Request(transaction);
    const resultVenta = await requestVenta
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre', sql.VarChar, nombre)
      .input('subtotal', sql.Decimal(10, 2), subtotal)
      .input('iva', sql.Decimal(10, 2), iva)
      .input('total', sql.Decimal(10, 2), total)
      .input('descuento', sql.Decimal(10, 2), 0)
      .input('fecha', sql.DateTime, new Date())
      .input('id_usuario', sql.Int, 1)
      .input('forma_pago', sql.VarChar, 'PAGO EN UNA SOLA EXHIBICION')
      .input('una_exibicion', sql.Char, 'S')
      .input('sucursal', sql.Char, 'BODEGA')
      .input('dias_credito', sql.Int, 0)
      .input('fecha_vence', sql.DateTime, new Date())
      .input('tipo_pago', sql.Char, 'I')
      .input('impuesto1', sql.Decimal(10, 2), 0)
      .input('impuesto2', sql.Decimal(10, 2), 0)
      .input('retencion', sql.Decimal(10, 2), 0)
      .input('formapagosat', sql.VarChar, '031')
      .input('entregado', sql.Char, 'N')
      .query(`
        INSERT INTO Ventas (
          id_cliente, nombre, subtotal, iva, total, descuento, fecha, 
          id_usuario, sucursal, forma_pago, una_exibicion, dias_credito, 
          fecha_vence, tipo_pago, impuesto1, impuesto2, retencion, formapagosat, entregado
        ) 
        OUTPUT INSERTED.id_venta
        VALUES (
          @id_cliente, @nombre, @subtotal, @iva, @total, @descuento, @fecha, 
          @id_usuario, @sucursal, @forma_pago, @una_exibicion, @dias_credito, 
          @fecha_vence, @tipo_pago, @impuesto1, @impuesto2, @retencion, @formapagosat, @entregado
        )
      `);
      
    const id_venta = resultVenta.recordset[0].id_venta;

    if (!id_venta) throw new Error("No se pudo obtener el ID de la venta recién creada.");

    for (const producto of productos) {
      const requestDetalle = new sql.Request(transaction);
      await requestDetalle
        .input('id_venta', sql.Int, id_venta)
        .input('id_producto', sql.VarChar, producto.ID_PRODUCTO)
        .input('descripcion', sql.VarChar, producto.DESCRIPCION)
        .input('cantidad', sql.Decimal(10, 2), producto.CANTIDAD)
        .input('precio_venta', sql.Decimal(10, 2), producto.PRECIO_VENTA)
        .input('precio_costo', sql.Decimal(10, 2), producto.PRECIO_COSTO)
        .input('importe', sql.Decimal(10, 2), producto.IMPORTE)
        .input('iva', sql.Decimal(10, 2), producto.IVA)
        .input('ganancia', sql.Decimal(10, 2), 0)
        .input('id_garantia', sql.Numeric, 0)
        .input('p_retencion', sql.Decimal(10, 2), 0)
        .input('i_retencion', sql.Decimal(10, 2), 0)
        .query(`
          INSERT INTO Ventas_detalle (
            id_venta, id_producto, descripcion, cantidad, precio_venta, precio_costo, importe, iva,
            ganancia, id_garantia, p_retencion, i_retencion
          ) VALUES (
            @id_venta, @id_producto, @descripcion, @cantidad, @precio_venta, @precio_costo, @importe, @iva,
            @ganancia, @id_garantia, @p_retencion, @i_retencion
          )
        `);
    }

    await transaction.commit();
    return { id_venta, success: true };

  } catch (error) {
    if (transactionStarted) {
      await transaction.rollback();
    }
    throw error;
  }
};