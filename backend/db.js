
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // fuerza a string
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),         // fuerza a número
});

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL ✅"))
  .catch(err => console.error("Error de conexión a PostgreSQL:", err));

export default pool;
