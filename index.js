import app from './src/app.js';
import { initializePools } from './src/config/db.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  await initializePools();
});
