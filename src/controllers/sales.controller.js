import { insertSaleWithDetails } from '../services/sales.service.js';
import { findClientByRfc } from '../services/clients.service.js';

export const createSale = async (req, res) => {
  try {
    const { subtotal, iva, total, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'No se pudo validar los productos' });
    }

    const cliente = await findClientByRfc('XAXX010101000');
    if (!cliente) {
      return res.status(404).json({ error: `Cliente no encontrado` });
    }

    const saleData = { 
      id_cliente: cliente.ID, 
      nombre: cliente.Nombre, 
      subtotal, 
      iva, 
      total 
    };

    const result = await insertSaleWithDetails(saleData, productos);

    res.status(201).json({
      mensaje: 'Venta creada exitosamente',
      id_venta: result.id_venta
    });

  } catch (error) {
    console.error('Error en createSale:', error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
};