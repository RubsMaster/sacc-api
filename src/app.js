import express from 'express';
import soldsRoutes from './routes/solds.routes.js';
import clientsRoutes from './routes/clients.routes.js'
const app = express();

app.use(express.json());

app.use('/api/solds', soldsRoutes);
app.use('/api/clients', clientsRoutes); 

export default app;