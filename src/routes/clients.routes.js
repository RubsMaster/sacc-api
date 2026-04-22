import { Router } from 'express';
import { getClientsWithCreditInfo, postCreateClient } from '../controllers/clients.controller.js';

const router = Router();

router.get('/credits', getClientsWithCreditInfo);
router.post('/', postCreateClient)

export default router;