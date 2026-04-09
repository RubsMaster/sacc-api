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
    .input('sucursal', sql.Char, 'BODEGA')
    .input('forma_pago', sql.Char, 'PAGO EN UNA SOLA EXHIBICION')
    .input('una_exibicion', sql.Char, 'S')
    .input('id_usuario', sql.Int, 1)
    .query(`
      INSERT INTO Ventas (
        id_cliente, nombre, subtotal, iva, total, descuento, fecha, sucursal, forma_pago, una_exibicion, id_usuario
      ) 
      OUTPUT INSERTED.id_venta
      VALUES (
        @id_cliente, @nombre, @subtotal, @iva, @total, @descuento, @fecha, @sucursal, @forma_pago, @una_exibicion, @id_usuario
      )
    `);
    
  return result.recordset[0];
};