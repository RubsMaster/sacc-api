import sql from 'mssql';
import 'dotenv/config';

const makeConfig = (prefix = '') => ({
  user: process.env[`${prefix}DB_USER`],
  password: process.env[`${prefix}DB_PASSWORD`],
  server: process.env[`${prefix}DB_SERVER`],
  database: process.env[`${prefix}DB_NAME`],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

const pools = { production: null, sandbox: null };

export const initializePools = async () => {
  try {
    pools.production = await new sql.ConnectionPool(makeConfig()).connect();
    console.log('Pool producción conectado');
    pools.sandbox = await new sql.ConnectionPool(makeConfig('SANDBOX_')).connect();
    console.log('Pool sandbox conectado');
  } catch (error) {
    console.error('Error conectando a las bases de datos:', error.message);
    process.exit(1);
  }
};

export const getPools = () => pools;
export { sql };
