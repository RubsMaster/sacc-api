import * as soldsService from '../services/solds.service.js';
import { findClientByRfc } from '../services/clients.service.js';
export const createSale = async (req, res) => {
  try {
    const { subtotal, iva, total } = req.body;
    
    const cliente = await findClientByRfc('XAXX010101000');
    
    if (!cliente || !cliente.ID) {
      return res.status(400).json({ error: 'No se encontró cliente público en general' });
    }

    const newSale = await soldsService.insertSale({ 
      id_cliente: cliente.ID, 
      nombre: cliente.Nombre, 
      rfc: cliente.RFC, 
      subtotal, 
      iva, 
      total 
    });
    
    res.status(201).json({
      mensaje: 'Venta creada exitosamente',
      venta: newSale
    });
  } catch (error) {
    console.error('Error en createSale:', error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
};