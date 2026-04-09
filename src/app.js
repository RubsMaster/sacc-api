import express from 'express';
import soldsRoutes from './routes/solds.routes.js';
const app = express();

app.use(express.json());

app.use('/api/solds', soldsRoutes); 

export default app;