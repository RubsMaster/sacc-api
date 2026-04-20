import { getConnection, sql } from "../config/db.js";

export const findProductByID = async (id) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id_producto", sql.VarChar, id)
    .query("SELECT * FROM ALMACEN3 WHERE ID_PRODUCTO = @id_producto");

  return result.recordset[0] ?? null;
};

export const createProduct = async (pool, transaction, producto) => {
  const result = await pool
    .request(transaction)
    .input("ID_PRODUCTO", sql.VarChar, producto.ID_PRODUCTO)
    .input("DESCRIPCION", sql.VarChar, producto.DESCRIPCION)
    .input("TIPO", sql.VarChar, "SIMPLE")
    .input("VENTA_WEB", sql.Char, "S")
    .input("MARCA", sql.VarChar, producto.MARCA ?? null)
    .input("GANANCIA", sql.Float, producto.PORCENAJE_GANANCIA ?? 0)
    .input("PRECIO_COSTO", sql.Float, producto.PRECIO_COSTO)
    .input("CLASIFICACION", sql.VarChar, "ORIGINAL")
    .input("PRECIO_EN", sql.VarChar, "PESOS")
    .input("USR_ALTA", sql.Int, 0)
    .input("FECHA_ALTA", sql.DateTime, new Date())
    .input("CATEGORIA", sql.VarChar, producto.CATEGORIA ?? null)
    .input("PRESENTACION", sql.VarChar, producto.PRESENTACION ?? null)
    .input("P_RETENCION", sql.Float, 0)
    .input("IVA", sql.Float, 0.16)
    .input("IMPUESTO1", sql.Float, 0)
    .input("IMPUESTO2", sql.Float, 0)
    .input("RETENCION", sql.Float, 0)
    .input("C_MAXIMA", sql.Float, 0)
    .input("C_MINIMA", sql.Float, 0)
    .input("ID_DESCUENTO", sql.VarChar, "0")
    .input("MATERIAL", sql.VarChar, "<NINGUNO>")
    .input("COLOR", sql.VarChar, "<NINGUNO>")
    .input("PEDIDO_SUCURSAL", sql.Char, "S")
    .input("CONTROLA_EXISTENCIA", sql.Char, "S")
    .query(`
      INSERT INTO ALMACEN3 (
        ID_PRODUCTO, DESCRIPCION, TIPO, VENTA_WEB, MARCA,
        GANANCIA, PRECIO_COSTO, CLASIFICACION, PRECIO_EN, USR_ALTA,
        FECHA_ALTA, CATEGORIA, PRESENTACION, P_RETENCION, IVA,
        IMPUESTO1, IMPUESTO2, RETENCION, PEDIDO_SUCURSAL, CONTROLA_EXISTENCIA,
        C_MINIMA, C_MAXIMA, ID_DESCUENTO, MATERIAL, COLOR
      ) VALUES (
        @ID_PRODUCTO, @DESCRIPCION, @TIPO, @VENTA_WEB, @MARCA,
        @GANANCIA, @PRECIO_COSTO, @CLASIFICACION, @PRECIO_EN, @USR_ALTA,
        @FECHA_ALTA, @CATEGORIA, @PRESENTACION, @P_RETENCION, @IVA,
        @IMPUESTO1, @IMPUESTO2, @RETENCION, @PEDIDO_SUCURSAL, @CONTROLA_EXISTENCIA,
        @C_MINIMA, @C_MAXIMA, @ID_DESCUENTO, @MATERIAL, @COLOR
      )
    `);
    return result
};