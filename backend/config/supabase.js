import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

const connectSupabase = () => {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    pool.on('connect', () => {
      console.log('✅ Conectado ao Supabase (Postgres)');
    });

    pool.on('error', (err) => {
      console.error('❌ Erro inesperado no pool do Postgres:', err);
      process.exit(-1);
    });

    return pool;
  } catch (error) {
    console.error(`❌ Erro ao conectar ao Supabase: ${error.message}`);
    process.exit(1);
  }
};

// Função helper para executar queries
export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default connectSupabase;
