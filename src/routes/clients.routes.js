import { Router } from 'express';
import { getClientByID, getClientsWithCreditInfo, postCreateClient } from '../controllers/clients.controller.js';

const router = Router();

router.get('/credits', getClientsWithCreditInfo);
router.get('/:id', getClientByID);
router.post('/', postCreateClient)

export default router;