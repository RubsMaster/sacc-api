import { Router } from 'express';
import { createSale } from '../controllers/solds.controller.js';

const router = Router();

router.post('/', createSale);

export default router;