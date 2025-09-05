import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') })

import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import multer from 'multer'
import puppeteer from 'puppeteer';
import fs from 'fs/promises'
import cron from 'node-cron'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPORTS_DIR = path.resolve(__dirname, 'reports')
console.log(REPORTS_DIR)

const app = express();
const PORT = process.env.PORT || 4000;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dionisioalex652@gmail.com',
    pass: 'xfpm tqni ptxn wapb'
  }
})

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const storage = multer.diskStorage({
  destination: './uploads/usuarios',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `usuario_${req.params.id}${ext}`)
  }
})

const upload = multer({storage})

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'))

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Rutas
app.get('/', (req, res) => {
  res.send('¡Servidor backend funcionando correctamente!');
});

// ------------------------ AUTENTICACIÓN Y REGISTRO ------------------------ //

// Iniciar sesión como administrador
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT u.*, d.nombre_dependencia
      FROM usuarios u
      LEFT JOIN dependencias d ON u.dependencia_id = d.id_dependencia
      WHERE u.email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    if (user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado: usuario no autorizado' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id_user,
        name: user.nombre,
        paterno: user.paterno,
        materno: user.materno,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono,
        imagen: user.imagen,
        dependencia: user.nombre_dependencia
      }
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Registro de administrador (con envio de contraseña temporal por correo)
app.post('/api/register', async (req, res) => {
  const { name, lastNameP, lastNameM, email, phoneNumber, rol = 'administrador'} = req.body;

  if (!name || !lastNameP || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: name, lastNameP, email' });
  }

  try {
    const plainTextPassword = Math.random().toString(36).slice(-8); // Contraseña temporal
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, rol) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_user',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, rol]
    );
    
    const newUser = result.rows[0];

    // Enviar correo electrónico al usuario
    await transporter.sendMail({
      from: '"Gestión de actividades" <dionisio652@gmail.com>',
      to: email,
      subject: 'Registro exitoso - Contraseña temporal',
      html: `
      <h3>Hola ${name} ${lastNameP},</h3>
      <p>Te has registrado exitosamente como <strong>${rol}</strong>.</p>
      <p><strong>Contraseña temporal:</strong> ${plainTextPassword}</p>
      <p>Te recomendamos cambiar esta contraseña al iniciar sesión</p>
      `
    })

    res.status(201).json({
      id_user: newUser.id_user,
      name,
      lastNameP,
      lastNameM,
      email,
      rol,
      phoneNumber,
      tempPassword: plainTextPassword,
      fecha_creacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === '23505') { // Código de violación de restricción única en PostgreSQL
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: `Fallo al crear usuario: ${error.message}` });
    }
  }
});

// Crear usuario (cualquier rol) con contraseña temporal
app.post('/api/users', async (req, res) => {
  const { name, lastNameP, lastNameM, email, phoneNumber, usuario_creador} = req.body;

  if (!name || !lastNameP || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: name, lastNameP, email' });
  }

  try {
    const plainTextPassword = Math.random().toString(36).slice(-8); // Contraseña temporal
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, usuario_creador) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_user',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, usuario_creador]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      id_user: newUser.id_user,
      name,
      lastNameP,
      lastNameM,
      email,
      phoneNumber,
      tempPassword: plainTextPassword,
      fecha_creacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: `Fallo al crear usuario: ${error.message}` });
    }
  }
});

// Crear administrador (similar a /users pero pensado para administrador)
app.post('/api/admin/login', async (req, res) => {
  const { name, lastNameP, lastNameM, email, phoneNumber, usuario_creador} = req.body;

  if (!name || !lastNameP || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: name, lastNameP, email' });
  }

  try {
    const plainTextPassword = Math.random().toString(36).slice(-8); // Contraseña temporal
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, usuario_creador) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_user',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, usuario_creador]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      id_user: newUser.id_user,
      name,
      lastNameP,
      lastNameM,
      email,
      phoneNumber,
      tempPassword: plainTextPassword,
      fecha_creacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: `Fallo al crear usuario: ${error.message}` });
    }
  }
})

// ----------------------------- CONSULTA PARA EL DASHBOARD -------------------------------- //

// Consulta para los cards superiores
app.get('/api/dashboard/estadisticas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(CASE WHEN avance = 100 THEN 1 END) AS tareasCompletadas,
        COUNT(CASE WHEN avance > 0 AND avance < 100 THEN 1 END) AS tareasEnProceso,
        COUNT(*) AS totalActividades
      FROM actividades      
    `)
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener actividades:', error.message)
    res.status(500).json({ error: 'Error al obtener actividades' })
  }
})

// Horas y asistencias por usuario
app.get('/api/horas/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const horasDiarias = await pool.query(`
      SELECT 
        DATE(r.fecha_actualizacion) AS dia,
        SUM(r.horas_trabajadas) AS horas_totales,
        SUM(CASE WHEN r.es_hora_extra = true THEN r.horas_trabajadas ELSE 0 END) AS horas_extra,
        COUNT(DISTINCT DATE(r.fecha_actualizacion)) AS dias_asistencia,
        CASE WHEN SUM(r.horas_trabajadas) < 8 THEN 1 ELSE 0 END AS incumple_dia
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = $1
      GROUP BY dia
      ORDER BY dia ASC
    `, [userId]);

    const horasSemanales = await pool.query(`
      SELECT 
          EXTRACT(YEAR FROM r.fecha_actualizacion) AS anio,
          EXTRACT(WEEK FROM r.fecha_actualizacion) AS semana,
          -- Calcular lunes de la semana
          TO_CHAR(
              r.fecha_actualizacion - EXTRACT(DOW FROM r.fecha_actualizacion)::integer * INTERVAL '1 day',
              'DD-MM'
          ) AS inicio_semana,
          -- Calcular viernes de la semana
          TO_CHAR(
              r.fecha_actualizacion - EXTRACT(DOW FROM r.fecha_actualizacion)::integer * INTERVAL '1 day' + INTERVAL '4 days',
              'DD-MM'
          ) AS fin_semana,
          SUM(r.horas_trabajadas) AS horas_totales,
          SUM(CASE WHEN r.es_hora_extra = true THEN r.horas_trabajadas ELSE 0 END) AS horas_extra,
          COUNT(DISTINCT DATE(r.fecha_actualizacion)) AS dias_asistencia,
          CASE WHEN SUM(r.horas_trabajadas) < 40 THEN 1 ELSE 0 END AS incumple_semana,
          ROUND((SUM(r.horas_trabajadas) / 40) * 100, 2) AS porcentaje_meta
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = $1
      GROUP BY anio, semana
      ORDER BY anio ASC, semana ASC;
    `, [userId]);

    res.json({ horasDiarias: horasDiarias.rows, horasSemanales: horasSemanales.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar horas y asistencias' });
  }
});

// Productividad y avance por usuario
app.get('/api/productividad/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const summary = await pool.query(`
       SELECT
          EXTRACT(YEAR FROM a.fecha_creacion) AS anio,
          EXTRACT(WEEK FROM a.fecha_creacion) AS semana,
          COUNT(*) AS total_tareas,
          SUM(CASE WHEN a.avance = 100 THEN 1 ELSE 0 END) AS tareas_completadas,
          COUNT(*) - SUM(CASE WHEN a.avance = 100 THEN 1 ELSE 0 END) AS tareas_pendientes,
          ROUND(AVG(a.avance), 2) AS promedio_avance,
          COALESCE(SUM(ra.horas_invertidas), 0) AS horas_invertidas,
          ROUND((COALESCE(SUM(ra.horas_invertidas), 0) / 40) * 100, 2) AS porcentaje_horas
      FROM actividades a
      LEFT JOIN (
          SELECT id_actividad, SUM(horas_trabajadas) AS horas_invertidas
          FROM registro_actividad
          GROUP BY id_actividad
      ) ra ON ra.id_actividad = a.id_activities
      WHERE a.usuario_asignado = $1
      GROUP BY anio, semana
      ORDER BY anio DESC, semana DESC;
      `, [userId])

    const weekly = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM r.fecha_actualizacion) AS anio,
        EXTRACT(WEEK FROM r.fecha_actualizacion) AS semana,
        ROUND(AVG(a.avance),2) AS promedio_avance
      FROM actividades a
      JOIN registro_actividad r ON a.id_activities = r.id_actividad
      WHERE a.usuario_asignado = $1
      GROUP BY anio, semana
      ORDER BY anio ASC, semana ASC
    `, [userId])

    res.json({ ...summary.rows[0], weekly: weekly.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar productividad' });
  }
});

// ------------------------- GESTIÓN DE USUARIOS ----------------------------- //

// Obtener todos los usuarios creados por un admin
app.get('/api/users/:usuario_creador', async (req, res) => {
  const { usuario_creador } = req.params;
  try {
    const users = await pool.query(`
      SELECT 
        id_user AS id_user,
        nombre AS name,
        paterno AS lastNameP,
        materno AS lastNameM,
        email,
        telefono AS phoneNumber,
        rol,
        TO_CHAR(fecha_creacion, 'DD/MM/YYYY') AS fecha_creacion
      FROM usuarios WHERE usuario_creador = $1
    `, [usuario_creador]);
    res.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener lista de trabajadores asociados a un administrador
app.get('/api/usuarios/trabajadores/:usuario_creador', async (req, res) => {
  const {usuario_creador} = req.params

  try {
    const rows = await pool.query(`
      SELECT id_user, nombre, paterno, materno
      FROM usuarios
      WHERE rol = 'trabajador' AND usuario_creador = $1`,
      [usuario_creador] 
    )
    res.json(rows.rows);
  } catch (error) {
    console.error('Error al obtener trabajadores:', error)
    res.status(500).json({ error: 'No se puedo obtener la lista de los trabajadores' });
  }
})

// Eliminar un usuario por su ID
app.put('/api/users/delete/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_user = $1', [id]
    )
    if (result.rowCount === 0) {
      return res.status(409).json({ error:'Usuario no encontrado' })
    }
    const rows = await pool.query('SELECT * FROM usuarios')
    if (rows.rows.length === 0) {
      return res.status(409).json({ error: 'Usuario no encontrado' })
    }
    res.json({ message: 'Eliminado con éxito', deletedUser: id })
  } catch (error) {
    console.error('Error al eliminar:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ---------------------------- GESTIÓN DE PROYECTOS ------------------------------ //

// Crear un nuevo proyecto
app.post('/api/project', async (req, res) => {
  const { project, description } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO proyectos (name_proyect, descripcion) VALUES ($1, $2) RETURNING id_proyecto`,
      [project, description]
    )
    res.status(201).json({
      id_proyecto: result.rows[0].id_proyecto,
      project,
      description
    })
  } catch (error) {
    console.error('Error al guardar proyecto', error)
    if (error.code === '23505') {
      res.status(409).json({ error: 'No se puede crear'})
    } else {
      res.status(500).json({ error: `Fallo al crear proyecto: ${error.message}`})
    }
  }
})

// Obtener todos los proyectos
app.get('/api/project', async (req, res) => {
  try {
    const project = await pool.query(
      `SELECT
        id_proyecto as id_project,
        name_proyect as name_project,
        descripcion as description 
        FROM proyectos`
    )
    res.json(project.rows)
  } catch (error) {
    console.error('Error fetching projects:', error.message)
    res.status(500).json({ error: 'Error al obtener proyectos'})
  }
})

// Actualizar un proyecto existente
app.put('/api/project/:id', async (req, res) => {
  const { id } = req.params
  const { project, description } = req.body
  try {
    const result = await pool.query(
      'UPDATE proyectos SET name_proyect = $1, descripcion = $2 WHERE id_proyecto = $3',
      [project, description, id]
    )
    if (result.rowCount === 0){
      return res.status(404).json({ error: 'Proyecto no encontrado'})
    }

    const rows = await pool.query('SELECT * FROM proyectos WHERE id_proyecto = $1', [id])

    if (rows.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto actualizado no encontrado' })
    }
    res.json({ message: 'Actualizado con exito', updatedProject: rows.rows[0]})
    
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ error: 'Error del servidor'})
  }
})

// -------------------------- GESTIÓN DE ACTIVIDADES ---------------------------- //

// Obtener todas las actividades (con nombre de usuario y proyecto)
app.get('/api/tasks/:idAdmin', async (req, res) => {
  const { idAdmin } = req.params
  try {
    const task = await pool.query(`
      SELECT
        a.id_activities,
        u.nombre AS nombre_asignado,
        u.paterno AS paterno_asignado,
        u.materno AS materno_asignado,
        p.name_proyect AS proyecto,
        a.descripcion,
        a.horas_trabajadas,
        a.actividad,
        a.avance,
        a.usuario_creador,
        a.fecha_creacion AS creation_raw,
        TO_CHAR(a.fecha_creacion, 'DD/MM/YYYY') AS creation,
        a.prioridad,
        TO_CHAR(fecha_limite, 'DD/MM/YYYY') AS limited
      FROM actividades a
      INNER JOIN usuarios u ON a.usuario_asignado = u.id_user
      INNER JOIN proyectos p ON a.proyecto = p.id_proyecto
      WHERE u.usuario_creador = $1 AND a.usuario_asignado != $2
    `, [idAdmin, idAdmin])
    res.json(task.rows)
  } catch (error) {
    console.error('Error fetching tasks:', error.message)
    res.status(500).json({ error: 'Error al obtener actividades'})
  }
})

// Crear una nueva actividad para un usuario (tambien creando notificación)
app.post('/api/tasks', async (req, res) => {
  const { usuario_id, proyecto_id, actividad, descripcion, prioridad, fecha_limite, usuario_creador } = req.body;
  if (!prioridad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios'})
  } 
  try {
    const result = await pool.query(
      `INSERT INTO actividades (proyecto, actividad, descripcion, usuario_asignado, prioridad, fecha_limite, usuario_creador, avance, horas_trabajadas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_activities`,
      [proyecto_id, actividad, descripcion, usuario_id, prioridad, fecha_limite, usuario_creador, 0, 0]
    )

    const idActividad = result.rows[0].id_activities;
    const mensaje = `te asignó una nueva actividad`
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, tipo, id_creador, id_actividad) VALUES ($1, $2, 'asignacion', $3, $4)`,
      [usuario_id, mensaje, usuario_creador, idActividad]
    )

    res.status(201).json({
      id_activities: idActividad,
      usuario_id,
      proyecto_id,
      actividad,
      descripcion,
      prioridad,
      fecha_creacion: new Date().toISOString(),
      fecha_limite,
      usuario_creador
    })
  } catch (error) {
    console.error('Error asignar actividas:', error)
    if (error.code === '23505') {
      res.status(409).json({ error: 'No se pudo asignar'})
    } else {
      res.status(500).json({ error: `Fallo al asignar actividad: ${error.message}`})
    }
  }
})

// Actualizar actividad (nombre, descripción, prioridad, fecha Límite)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { fecha_limite, actividad, descripcion, prioridad } = req.body;
  
  const updates = {};
  const values = [];
  let index = 1;
  
  if(fecha_limite !== undefined) {
    updates.fecha_limite = fecha_limite;
    values.push(fecha_limite);
  }
  if(actividad !== undefined) {
    updates.actividad = actividad;
    values.push(actividad);
  }
  if(descripcion !== undefined) {
    updates.descripcion = descripcion;
    values.push(descripcion);
  }
  if(prioridad !== undefined) {
    updates.prioridad = prioridad;
    values.push(prioridad);
  }
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }
  
  const setClause = Object.keys(updates)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');
    
  values.push(id);
  
  try {
    const result = await pool.query(
      `UPDATE actividades SET ${setClause} WHERE id_activities = $${values.length}`,
      values
    );
    
    if (result.rowCount === 0) {
      return res.status(409).json({ error: 'Actividad no encontrada' });
    }

    const rows = await pool.query('SELECT * FROM actividades WHERE id_activities = $1', [id])

    if (rows.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' })
    }

    res.json({ message: 'Actualizado con exito', updatedTask: { id, ...updates} })
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ error: 'Error del servidor'})
  }
}) 

// Eliminar una actividad por su ID
app.put('/api/tasks/delete/:id', async (req, res) => {
  const { id } = req.params
  try {
    // Eliminar registros relacionados
    await pool.query(
      'DELETE FROM registro_actividad WHERE id_actividad = $1', [id]
    )

    await pool.query(
      'DELETE FROM actividades WHERE id_activities = $1', [id]
    )

    res.status(200).json({ message: 'Actividad eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Validar el cumplimiento de las 8 horas al día
app.get('/api/usuarios/:id/horas-hoy', async (req, res) => {
  const { id } = req.params
  try {
    const rows = await pool.query(`
      SELECT SUM(r.horas_trabajadas) AS total_horas
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = $1
      AND DATE(r.fecha_actualizacion) = CURRENT_DATE
    `, [id])
    res.json({ total_horas: rows.rows[0].total_horas || 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al consultar horas del día' })
  }
})

// Guardar nueva Actividad
app.post('/api/tasks/admin', async (req, res) => {
  const {
    usuario_id,
    proyecto_id,
    actividad,
    descripcion,
    prioridad,
    usuario_creador,
    avance,
    horas,
  } = req.body

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const result = await client.query(`
      INSERT INTO actividades (
        proyecto, actividad, descripcion, prioridad,
        fecha_creacion, usuario_asignado, avance, horas_trabajadas, fecha_limite
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW()) RETURNING id_activities`,
      [proyecto_id, actividad, descripcion, prioridad, usuario_creador, avance, horas]  
    )
    const idActividad = result.rows[0].id_activities

    // Insertar en registro_actividad
    await client.query(`
      INSERT INTO registro_actividad (id_actividad, avance, horas_trabajadas, fecha_actualizacion)
        VALUES ($1, $2, $3, NOW())    
    `, [idActividad, avance, horas])

    await client.query('COMMIT')

    res.status(201).json({
      id_activities: idActividad,
      usuario_id,
      proyecto_id,
      actividad,
      descripcion,
      prioridad,
      fecha_creacion: new Date().toISOString(),
      usuario_creador
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al asignar actividad y registrar avance:', error)

    if (error.code === '23505') {
      res.status(409).json({ error: 'No se puedo asignar, entrada duplicada' })
    } else {
      res.status(500).json({ error: `Fallo al asignar actividad: ${error.message}`})
    }
  } finally {
    client.release()
  }
})

// Actualizar actividades en el modal de admin
app.put('/api/actividades/:id', async (req, res) => {
  const { id } = req.params
  const { actividad, descripcion } = req.body

  try {
    const result = await pool.query(
      'UPDATE actividades SET actividad = $1, descripcion = $2 WHERE id_activities = $3',
      [actividad, descripcion, id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' })
    }

    res.json({ message: 'Actividad actualizada correctamente' })
  } catch (error) {
    console.error('Error al actualizar actividad:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Actualizar registros de actividade por fechas
app.put('/api/actividades/:id/avance', async (req, res) => {
  const { id } = req.params
  const { horas_trabajadas, avance } = req.body

  try {
    await pool.query(`
      INSERT INTO registro_actividad (id_actividad, horas_trabajadas, avance, fecha_actualizacion)
        VALUES ($1, $2, $3, NOW())`,
      [id, horas_trabajadas, avance]
    )

    // Obtener la suma total de horas trabajadas
    const totalHorasResult = await pool.query(`
      SELECT SUM(horas_trabajadas) AS totalHoras
      FROM registro_actividad
      WHERE id_actividad = $1 
    `, [id])

    // Actualizar actividades con la suma de horas y fecha limite
    await pool.query(`
      UPDATE actividades
      SET
        horas_trabajadas = $1,
        fecha_limite = NOW(),
        avance = $2
      WHERE id_activities = $3
    `, [totalHorasResult.rows[0].totalhoras || 0, avance, id])

    res.json({ message: 'Registro de actividad actualizado correctamente' })
  } catch (error) {
    console.error('Error al actualizar registro_actividad:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Consulta para cargar las actividades de los cards 
app.get('/api/actividades/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const tasks = await pool.query(`
      SELECT
        a.id_activities,
        a.actividad,
        a.descripcion,
        a.avance,
        a.prioridad,
        a.fecha_creacion,
        a.fecha_limite,
        p.name_proyect,
        COALESCE(SUM(r.horas_trabajadas), 0) AS horas_trabajadas
      FROM actividades a
      LEFT JOIN registro_actividad r ON a.id_activities = r.id_actividad
      LEFT JOIN proyectos p ON a.proyecto = p.id_proyecto
      WHERE a.usuario_asignado = $1
      GROUP BY a.id_activities, p.name_proyect
    `, [id_usuario]);
      res.json(tasks.rows)
  } catch (error) {
    console.error('Error al obtener actividades:', error.message);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

// Consultas para las estadisticas de actividades MyActivitiesView
app.get('/api/estadisticas/:idUser', async (req, res) => {
  const { idUser } = req.params
  try {
    const result = await pool.query(`
      SELECT
        COUNT(CASE WHEN avance = 100 THEN 1 END) AS tareasCompletadas,
        COUNT(CASE WHEN avance < 100 THEN 1 END) AS enProgreso,
        COUNT(*) AS tareasTotales
      FROM actividades
      WHERE usuario_asignado = $1
    `, [idUser])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener datos:', error.message)
    res.status(500).json({ error: 'Error al obtener estadisticas' })
  }
})

// Consulta para el progreso de actividades el avance de las actividades
app.get('/api/registros-avances/:idActividad', async (req, res) => {
  const { idActividad } = req.params
  try {
    const rows = await pool.query(`
      SELECT avance, fecha_actualizacion
      FROM registro_actividad
      WHERE id_actividad = $1
      ORDER BY fecha_actualizacion DESC
    `, [idActividad])
    
    res.json(rows.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener los registros de avance' })
  }
})
// Función para generar reporte
async function generarReporteQuincenalPDF(usuarioId) {
  try {
    const userInfoResult = await pool.query(`
      SELECT 
        u.nombre AS nombre,
        u.paterno AS paterno,
        u.materno AS materno,
        d.nombre_dependencia AS dependencia
      FROM usuarios u
      LEFT JOIN dependencias d ON u.dependencia_id = d.id_dependencia
      WHERE u.id_user = $1
    `, [usuarioId]);
    
    const userInfo = userInfoResult.rows[0];

    const nombreCompleto = `${userInfo?.nombre || ''} ${userInfo?.paterno || ''} ${userInfo?.materno || ''}`.trim();

    // Generar iniciales
    const iniciales = `${userInfo?.nombre?.charAt(0) || ''}${userInfo?.paterno?.charAt(0) || ''}${userInfo?.materno?.charAt(0) || ''}`.toUpperCase();

    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth();
    let inicioQuincena, finQuincena;
    if (hoy.getDate() <= 15) {
      inicioQuincena = new Date(year, month, 1);
      finQuincena = new Date(year, month, 15);
    } else {
      inicioQuincena = new Date(year, month, 16);
      finQuincena = new Date(year, month + 1, 0);
    }
    const fechaInicioStr = inicioQuincena.toISOString().split('T')[0];
    const fechaFinStr = finQuincena.toISOString().split('T')[0];

    const actividadesResult = await pool.query(`
      SELECT 
        p.name_proyect AS proyecto,
        a.actividad,
        a.descripcion,
        a.horas_trabajadas AS horas,
        a.avance,
        a.fecha_creacion AS fecha_inicio,
        a.fecha_limite AS fecha_finalizacion
      FROM actividades a
      LEFT JOIN proyectos p ON a.proyecto = p.id_proyecto
      LEFT JOIN registro_actividad r
        ON r.id_actividad = a.id_activities
        AND r.fecha_actualizacion BETWEEN $1 AND $2
      WHERE a.usuario_asignado = $3
        AND a.estado <> 'rechazada'
      GROUP BY p.name_proyect, a.id_activities
      ORDER BY p.name_proyect, a.fecha_creacion
    `, [fechaInicioStr, fechaFinStr, usuarioId]);
    
    const rows = actividadesResult.rows;

    const proyectosMap = {};
    rows.forEach(row => {
      if (!proyectosMap[row.proyecto]) proyectosMap[row.proyecto] = [];
      proyectosMap[row.proyecto].push(row);
    });

    const mesesAbre = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mesAbre = mesesAbre[inicioQuincena.getMonth()];
    const diaInicio = String(inicioQuincena.getDate()).padStart(2, '0');
    const diaFin = String(finQuincena.getDate()).padStart(2, '0');
    const fechaStr = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${year}`;
    const periodoTexto = `${diaInicio}/${mesAbre}/${year} - ${diaFin}/${mesAbre}/${year}`;
    const nombreArchivo = `Reporte_${iniciales}_${fechaStr}_${diaInicio}-${diaFin}${mesAbre}.pdf`;

    let actividadesHTML = '';
    for (const [proyecto, actividades] of Object.entries(proyectosMap)) {
      actividadesHTML += `
        <div style="margin-top:1rem;">
          <p style="font-size:0.9rem; margin-bottom:0.5rem;"><strong>Proyecto:</strong> ${proyecto || 'Sin nombre'}</p>
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem; border:1px solid #ccc;">
            <thead style="background-color:#34495e; color:white;">
              <tr>
                <th style="padding:8px; border:1px solid #ccc;">Actividad</th>
                <th style="padding:8px; border:1px solid #ccc;">Descripción</th>
                <th style="padding:8px; border:1px solid #ccc;">Horas</th>
                <th style="padding:8px; border:1px solid #ccc;">Avance</th>
                <th style="padding:8px; border:1px solid #ccc;">Fecha de inicio</th>
                <th style="padding:8px; border:1px solid #ccc;">Fecha de finalización</th>
              </tr>
            </thead>
            <tbody>
              ${actividades.map(a => `
                <tr>
                  <td style="padding:8px; border:1px solid #ccc;">${a.actividad}</td>
                  <td style="padding:8px; border:1px solid #ccc;">${a.descripcion}</td>
                  <td style="padding:8px; border:1px solid #ccc; text-align:center;">${a.horas}</td>
                  <td style="padding:8px; border:1px solid #ccc; text-align:center;">${a.avance}%</td>
                  <td style="padding:8px; border:1px solid #ccc; text-align:center;">${a.fecha_inicio ? new Date(a.fecha_inicio).toLocaleDateString('es-MX') : '---'}</td>
                  <td style="padding:8px; border:1px solid #ccc; text-align:center;">${a.fecha_finalizacion ? new Date(a.fecha_finalizacion).toLocaleDateString('es-MX') : '---'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const fechaGeneracion = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="padding:3rem; font-family:Arial, sans-serif; color:#333;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #ccc; padding-bottom:1rem;">
            <div><img src="LOGOESC-FINANZAS.png" style="width:200px;" /></div>
            <div style="text-align:right;">
              <h4 style="margin:0; font-weight:bold; color:#2c3e50;">Sistema de Gestión y Control de Actividades</h4>
              <p style="font-size:0.9rem; color:#7f8c8d; margin:0;">Reporte formal corporativo</p>
            </div>
          </div>

          <div style="text-align:center; margin-top:2rem;">
            <h3 style="font-weight:bold; color:#34495e;">Reporte Quincenal de Actividades</h3>
            <p style="color:#7f8c8d; font-size:0.95rem;">Resumen de actividades realizadas y progreso quincenal</p>
          </div>

          <div style="margin-top:2rem;">
            <table style="width:100%; border-collapse:collapse; font-size:0.95rem;">
              <tbody>
                <tr>
                  <th style="width:30%; background-color:#ecf0f1; padding:8px;">Nombre</th>
                  <td style="padding:8px;">${nombreCompleto || '---'}</td>
                </tr>
                <tr>
                  <th style="background-color:#ecf0f1; padding:8px;">Dependencia</th>
                  <td style="padding:8px;">${userInfo?.dependencia || '---'}</td>
                </tr>
                <tr>
                  <th style="background-color:#ecf0f1; padding:8px;">Horas Trabajadas</th>
                  <td style="padding:8px;">${rows.reduce((acc, r) => acc + parseFloat(r.horas || 0), 0)} horas en la quincena</td>
                </tr>
                <tr>
                  <th style="background-color:#ecf0f1; padding:8px;">Fecha de Generación</th>
                  <td style="padding:8px;">${fechaGeneracion}</td>
                </tr>
                <tr>
                  <th style="background-color:#ecf0f1; padding:8px;">Periodo</th>
                  <td style="padding:8px;">Del ${inicioQuincena.toLocaleDateString('es-MX')} al ${finQuincena.toLocaleDateString('es-MX')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="text-align:center; margin-top:3rem;">
            <h4 style="color:#34495e; font-weight:bold;">Actividades Realizadas</h4>
          </div>

          ${actividadesHTML}

          <div style="text-align:right; margin-top:2rem; font-size:0.8rem; color:#7f8c8d;">
            Generado automáticamente por el Sistema de Gestión y Control de Actividades
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return { pdfBuffer, nombreArchivo, periodoTexto, usuarioId, rutaRelativa: path.join('reportes', nombreArchivo) };
  } catch (error) {
    console.error('Error en generarReporteQuincenalPDF:', error);
    throw error;
  }
}

// Guardar en carpeta y bd con logs de depuración
async function guardarReporte({ pdfBuffer, nombreArchivo, periodoTexto, usuarioId, rutaRelativa }) {
  try {
    // Crear carpeta
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    // Ruta completa
    const rutaCompleta = path.join(REPORTS_DIR, nombreArchivo);
    // Guardar archivo
    await fs.writeFile(rutaCompleta, pdfBuffer);

    // Guardar en BD
    const result = await pool.query(`
      INSERT INTO reportes_generados (usuario_id, nombre_archivo, ruta, periodo, fecha_generacion)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [usuarioId, nombreArchivo, rutaCompleta, periodoTexto]);
    
    return rutaCompleta;

  } catch (error) {
    console.error("Error en guardarReporte:", error);
    throw error;
  }
}

// Generar automaticamente el dia 15 y ultimo de cada mes a las 23:59
async function cargarUsuarios() {
  try {
    const usuariosResult = await pool.query(`
      SELECT id_user FROM usuarios WHERE activo = true
    `);
    
    return usuariosResult.rows.map(u => ({ id_user: u.id_user }));
  } catch (error) {
    console.error('Error en cargarUsuarios:', error);
    throw error;
  }
}

function configuracionGenerarReportes() {
  cron.schedule('59 23 * * *', async () => {
    try {
      const hoy = new Date();
      const dia = hoy.getDate();
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();

      if (dia !== 15 && dia !== ultimoDiaMes) return;

      console.log(`[${new Date().toISOString()}] Cron: generando reportes quincenales (día ${dia})`);
      const usuarios = await cargarUsuarios();

      for (const usuario of usuarios) {
        try {
          const result = await generarReporteQuincenalPDF(usuario.id_user);
          const rutaGuardada = await guardarReporte(result);
          console.log(`Reporte generado para usuario ${usuario.id_user} -> ${rutaGuardada}`);
        } catch (err) {
          console.error(`Error generando reporte para usuario ${usuario.id_user}:`, err);
        }
      }
    } catch (err) {
      console.error('Error en cron generar reportes:', err);
    }
  }, {
    timezone: 'America/Merida'
  });
}

// Obtener todos los reportes generados
app.get('/api/reportes-generados/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM reportes_generados WHERE usuario_id = $1 ORDER BY fecha_generacion DESC',
      [usuarioId]
    );

    const meses = {
      'ene': 'enero',
      'feb': 'febrero',
      'mar': 'marzo',
      'abr': 'abril',
      'may': 'mayo',
      'jun': 'junio',
      'jul': 'julio',
      'ago': 'agosto',
      'sep': 'septiembre',
      'oct': 'octubre',
      'nov': 'noviembre',
      'dic': 'diciembre'
    };

    const reportesFormateados = result.rows.map(r => {
      let periodoFormateado = r.periodo;

      if (r.periodo.includes('-')) {
        const [inicio, fin] = r.periodo.split('-').map(p => p.trim());

        const [diaInicio] = inicio.split('/');
        const [diaFin, mesAbrev, anio] = fin.split('/');

        const mesCompleto = meses[mesAbrev.toLowerCase()] || mesAbrev;

        periodoFormateado = `${diaInicio} al ${diaFin} de ${mesCompleto} ${anio}`;
      }

      return { ...r, periodo: periodoFormateado };
    });

    res.json(reportesFormateados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los reportes generados' });
  }
});

// Descargar pdf desde reportes
app.get('/api/reportes-generados/:id/descargar', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT ruta, nombre_archivo FROM reportes_generados WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    const { ruta, nombre_archivo } = result.rows[0];
    res.download(ruta, nombre_archivo); // envía el archivo
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al descargar el reporte' });
  }
});

// -------------------------- PERFIL DEL ADMIN ---------------------------- //

// INSERT Para guardar imagen de perfil
app.post('/api/usuarios/:id/imagen', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    console.log('No se recibió archivo');
    return res.status(400).json({ error: 'No se recibió archivo' });
  }

  const ruta = `/uploads/usuarios/${req.file.filename}`;

  try {
    await pool.query('UPDATE usuarios SET imagen = $1 WHERE id_user = $2', [ruta, id]);
    res.json({ success: true, ruta });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// GET: Obtener ruta de imagen del usuario
app.get('/api/usuarios/:id/imagen', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT imagen FROM usuarios WHERE id_user = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const imagen = result.rows[0].imagen;
    res.json({ success: true, imagen });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar datos del usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, paterno, materno, email, telefono } = req.body;

  try {
    const result = await pool.query(`
      UPDATE usuarios SET
        nombre = $1,
        paterno = $2,
        materno = $3,
        email = $4,
        telefono = $5
      WHERE id_user = $6
      RETURNING *`,
      [nombre, paterno, materno, email, telefono, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message, error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar password actual
app.post('/api/usuarios/verificar-password/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id_user = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const esValida = await bcrypt.compare(password, user.password_hash);

    res.json({ success: true, esValida });
  } catch (error) {
    console.error('Error al verificar la contraseña:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Actualizar contraseña
app.put('/api/usuarios/:id/password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT password_hash FROM usuarios WHERE id_user = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hashedPassword = result.rows[0].password_hash;
    const isMatch = await bcrypt.compare(currentPassword, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'La contraseña actual no es correcta' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id_user = $2', [newHashedPassword, id]);
    
    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
   
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

configuracionGenerarReportes();
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});