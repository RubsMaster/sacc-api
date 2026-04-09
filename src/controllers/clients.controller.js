import { getClientsCredit } from '../services/clients.service.js';

export const getClientsWithCreditInfo = async (req, res) => {
  try {
    const clients = await getClientsCredit();
    res.json({
      totalRegistros: clients.length,
      clientes: clients
    });
  } catch (error) {
    console.error('Error en getClientsWithCreditInfo:', error);
    res.status(500).json({ error: 'Error al obtener la información de crédito' });
  }
};