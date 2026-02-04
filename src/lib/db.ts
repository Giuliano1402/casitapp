/**
 * Database Connection
 * Configuración de conexión a PostgreSQL
 */
import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

/**
 * Inicializa la conexión a la base de datos
 */
export const initializeDatabase = (): Pool => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    user: process.env.DB_USER || 'zeus',
    password: process.env.DB_PASSWORD || 'zeus1402',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'casitapp',
  });

  pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('❌ Error en el pool de conexiones:', err);
  });

  return pool;
};

/**
 * Obtiene la instancia del pool
 */
export const getPool = (): Pool => {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
};

/**
 * Ejecuta una query
 */
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const currentPool = getPool();
  return currentPool.query<T>(text, params);
};

/**
 * Cierra la conexión a la base de datos
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
console.log('DB:', process.env.DATABASE_URL);
  