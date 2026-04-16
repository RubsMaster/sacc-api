import { Router } from 'express';
import { createSale } from '../controllers/sales.controller.js';

const router = Router();

router.post('/create', createSale);

export default router;