import { getConnection, sql } from '../config/db.js';

export const insertSale = async (saleData) => {
  const { id_cliente, nombre, subtotal, iva, total } = saleData;
  const pool = await getConnection();
  
  const result = await pool.request()
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
      id_cliente,
      nombre,
      subtotal,
      iva,
      total,
      descuento,
      fecha,
      id_usuario,
      sucursal,
      forma_pago,
      una_exibicion,
      dias_credito,
      fecha_vence,
      tipo_pago,
      impuesto1,
      impuesto2,
      retencion,
      formapagosat,
      entregado
    ) 
    OUTPUT INSERTED.id_venta
    VALUES (
      @id_cliente,
      @nombre,
      @subtotal,
      @iva,
      @total,
      @descuento,
      @fecha,
      @id_usuario,
      @sucursal,
      @forma_pago,
      @una_exibicion,
      @dias_credito,
      @fecha_vence,
      @tipo_pago,
      @impuesto1,
      @impuesto2,
      @retencion,
      @formapagosat,
      @entregado
    )
  `);
    
  return result.recordset[0];
};