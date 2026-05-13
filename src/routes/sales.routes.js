import { Router } from 'express';
import { createSale, getClientSales } from '../controllers/sales.controller.js';

const router = Router();

router.get('/:id', getClientSales)
router.post('/create', createSale);

export default router;