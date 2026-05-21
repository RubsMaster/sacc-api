import * as salesService from "../services/sales.service.js";
import * as clientService from "../services/clients.service.js";
import * as productsService from "../services/products.service.js"
import { getConnection } from "../config/db.js";

const RFC_PUBLICO_GENERAL = "XAXX010101000";

export const createSaleRequi = async (req, res) => {
  const { id_cliente, comentario, productos = [] } = req.body;
  if (!productos || productos.length <= 0) {
    return res
      .status(400)
      .json({ error: "No se pueden registrar ventas sin producto" });
  }
  let publicoGeneral = false;
  let newSale = null;
  const pool = await getConnection();
  const transaction = pool.transaction();
  try {
    let cliente;
    if (!id_cliente || id_cliente <= 0) {
      cliente = await clientService.findClientByRfc(RFC_PUBLICO_GENERAL);
    } else {
      cliente = await clientService.getClientCreditByID(id_cliente);
    }

    if (!cliente?.ID) {
      return res.status(404).json({ error: "No se encontró cliente" });
    }

    await transaction.begin();

    newSale = await salesService.insertSaleRequest(
      pool,
      transaction,
      cliente.ID,
      comentario
    );
    console.log(newSale)
    await salesService.insertSaleRequestDetails(
      pool, 
      transaction, 
      newSale.no_pedido,
      comentario,
      productos,
    );

    for (const producto of productos) {
      let existe = await productsService.findProductByID(producto.ID_PRODUCTO);
      if (!existe) {
        existe = await productsService.createProduct(pool, transaction, producto);
      }
      await salesService.insertRequi(pool, transaction, producto, comentario);
    }

    await transaction.commit();

    res.status(201).json({
      mensaje: "Venta programada creada exitosamente",
      venta: { ...newSale, productos },
    });
  } catch (error) {
    await transaction.rollback().catch(() => {});
    console.error("Error en createSale:", error);
    res.status(500).json({ error: "Error al registrar la venta" });
  }
};

export const getClientSales = async (req, res) => {
  try {
    const id = req.params.id;
    const sales = await salesService.getClientSales(id);
    res.json({
      totalRegistros: sales.length,
      ventas: sales,
    });
  } catch (error) {
    console.error("Error en getClientSales:", error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};
// newSale = await salesService.insertSale(pool, transaction, {
//   id_cliente: cliente.ID,
//   nombre: cliente.nombre || "desconocido",
//   dias: cliente.dias_credito,
//   credito,
//   subtotal,
//   iva,
//   total,
// });

// await salesService.insertSaleDetails(
//   pool,
//   transaction,
//   newSale.id_venta,
//   productos,
// );

// await salesService.insertDebt(
//   pool,
//   transaction,
//   newSale.id_venta,
//   cliente.ID,
//   total,
//   cliente.dias_credito,
// );
