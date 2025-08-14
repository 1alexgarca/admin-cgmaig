
     import pool from './db.js';

     async function testConnection() {
       try {
         const connection = await pool.getConnection();
         console.log('Successfully connected to MySQL database!');
         const [rows] = await connection.query('SELECT 1 + 1 AS result');
         console.log('Test query result:', rows[0].result); // Should print 2
         connection.release();
       } catch (error) {
         console.error('Failed to connect to MySQL:', error.message);
       } finally {
         await pool.end();
       }
     }

     testConnection();
