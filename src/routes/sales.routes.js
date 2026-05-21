import { Router } from 'express';
import { createSaleRequi, getClientSales } from '../controllers/sales.controller.js';

const router = Router();

router.get('/:id', getClientSales)
router.post('/create', createSaleRequi);

export default router;