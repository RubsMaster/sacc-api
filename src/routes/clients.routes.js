import { Router } from 'express';
import { getClientsWithCreditInfo } from '../controllers/clients.controller.js';

const router = Router();

router.get('/clientsCreditInfo', getClientsWithCreditInfo);

export default router;