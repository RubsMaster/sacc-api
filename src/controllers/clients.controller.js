import { getClientsCredit, createClient, findClientByRfc, findClientByID } from '../services/clients.service.js';

export const getClientsWithCreditInfo = async (req, res) => {
  try {
    const clients = await getClientsCredit(req.db);
    res.json({
      totalRegistros: clients.length,
      clientes: clients
    });
  } catch (error) {
    console.error('Error en getClientsWithCreditInfo:', error);
    res.status(500).json({ error: 'Error al obtener la información de crédito' });
  }
};

export const postCreateClient = async (req, res) => {
  const {
    nombre, rfc, telefono_casa, pais, direccion,
    ciudad, colonia, numero_exterior, cp, email,
    usoCFDI, regimenfiscal
  } = req.body;

  try {
    const clienteExistente = await findClientByRfc(req.db, rfc);

    if (clienteExistente) {
      return res.status(409).json({ error: 'Ya existe un cliente registrado con ese RFC' });
    }

    const newClient = await createClient(req.db, {
      nombre, rfc, telefono_casa, pais, direccion,
      ciudad, colonia, numero_exterior, cp, email,
      usoCFDI, regimenfiscal
    });

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: newClient
    });

  } catch (error) {
    console.error('Error en postCreateClient:', error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

export const getClientByID = async (req, res) => {
  try {
    const id = req.params.id;
    const client = await findClientByID(req.db, id);
    res.json(client);
  } catch (error) {
    console.error('Error en getClientByID:', error);
    res.status(500).json({ error: 'Error al obtener la información del cliente' });
  }
};
