import * as salesService from "../services/sales.service.js";
import * as clientService from "../services/clients.service.js";
import { getConnection } from "../config/db.js";

const RFC_PUBLICO_GENERAL = "XAXX010101000";

export const createSale = async (req, res) => {
  const {
    subtotal,
    iva,
    total,
    credito,
    id_cliente,
    productos = [],
  } = req.body;
  if (!productos || productos.length <= 0) {
    return res
      .status(400)
      .json({ error: "No se pueden registrar ventas sin producto" });
  }

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
      return res.status(400).json({ error: "No se encontró cliente" });
    }

    await transaction.begin();

    const newSale = await salesService.insertSale(pool, transaction, {
      id_cliente: cliente.ID,
      nombre: cliente.nombre || "desconocido",
      dias: cliente.dias_credito,
      credito,
      subtotal,
      iva,
      total,
    });

    await salesService.insertSaleDetails(
      pool,
      transaction,
      newSale.id_venta,
      productos,
    );

    await salesService.insertDebt(
      pool,
      transaction,
      newSale.id_venta,
      cliente.ID,
      total,
      cliente.dias_credito,
    );

    await transaction.commit();

    res.status(201).json({
      mensaje: "Venta creada exitosamente",
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
    const id = req.params.id
    const sales = await salesService.getClientSales(id)
    res.json({
      totalRegistros: sales.length,
      ventas: sales,
    });
  } catch (error) {
    console.error("Error en getClientSales:", error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};
