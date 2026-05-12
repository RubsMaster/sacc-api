import express from 'express';
import salesRoutes from './routes/sales.routes.js';
import clientsRoutes from './routes/clients.routes.js'
import productsRoutes from './routes/products.routes.js'
const app = express();

app.use(express.json());

app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/products', productsRoutes);
export default app;