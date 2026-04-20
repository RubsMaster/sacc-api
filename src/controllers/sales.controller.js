import * as salesService from '../services/sales.service.js';
import * as clientService from '../services/clients.service.js';
import { getConnection } from '../config/db.js';

const RFC_PUBLICO_GENERAL = 'XAXX010101000';

export const createSale = async (req, res) => {
  const { subtotal, iva, total, productos = [] } = req.body;

  const pool = await getConnection();
  const transaction = pool.transaction();

  try {
    const cliente = await clientService.findClientByRfc(RFC_PUBLICO_GENERAL);

    if (!cliente?.ID) {
      return res.status(400).json({ error: 'No se encontró cliente público en general' });
    }

    await transaction.begin();

    const newSale = await salesService.insertSale(pool, transaction, {
      id_cliente: cliente.ID,
      nombre: cliente.Nombre,
      rfc: cliente.RFC,
      subtotal,
      iva,
      total,
    });

    if (productos.length > 0) {
      await salesService.insertSaleDetails(pool, transaction, newSale.id_venta, productos);
    }

    await transaction.commit();

    res.status(201).json({
      mensaje: 'Venta creada exitosamente',
      venta: { ...newSale, productos },
    });

  } catch (error) {
    await transaction.rollback().catch(() => {});
    console.error('Error en createSale:', error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
};