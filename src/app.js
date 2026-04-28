import express from 'express';
import salesRoutes from './routes/sales.routes.js';
import clientsRoutes from './routes/clients.routes.js'
const app = express();

app.use(express.json());

app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes); 

export default app;