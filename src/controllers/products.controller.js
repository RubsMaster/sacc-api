import { getAllProducts } from '../services/products.service.js';

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts(req.db);
    res.json({
      totalRegistros: products.length,
      productos: products
    });
  } catch (error) {
    console.error('Error en getProducts:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};
