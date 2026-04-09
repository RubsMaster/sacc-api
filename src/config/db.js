import sql from 'mssql';
import 'dotenv/config';

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, 
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    console.log('✅ Conexión a la base de datos SQL Server exitosa');
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1); 
  }
};
export { sql };