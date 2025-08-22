import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import multer from 'multer'
import path from 'path'
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
    const [rows] = await pool.query(`
      SELECT u.*, d.nombre_dependencia
      FROM usuarios u
      LEFT JOIN dependencias d ON u.dependencia_id = d.id_dependencia
      WHERE u.email = ?`,
        [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = rows[0];

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

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, rol]
    );
    

    //Enviar correo electrónico al usuario
    await transporter.sendMail({
      from: '"Gestión de actividades" <dionisio652@gmail.com>',
      to: email,
      subject: 'Registro exitoso -  Contraseña temporal',
      html: `
      <h3>Hola ${name} ${lastNameP},</h3>
      <p>Te has registrado exitosamente como <strong>${rol}</strong>.</p>
      <p><strong>Contraseña temporal:</strong> ${plainTextPassword}</p>
      <p>Te recomendamos cambiar esta contraseña al iniciar sesión</p>
      `
    })

    res.status(201).json({
      id_user: result.insertId,
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
    if (error.code === 'ER_DUP_ENTRY') {
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

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, usuario_creador) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, usuario_creador]
    );

    res.status(201).json({
      id_user: result.insertId,
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
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: `Fallo al crear usuario: ${error.message}` });
    }
  }
});

// Crear administrador (simiar a /users pero pensado para administrador)
app.post('/api/admin/login', async (req, res) => {
  const { name, lastNameP, lastNameM, email, phoneNumber, usuario_creador} = req.body;

  if (!name || !lastNameP || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: name, lastNameP, email' });
  }

  try {
    const plainTextPassword = Math.random().toString(36).slice(-8); // Contraseña temporal
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, paterno, materno, email, telefono, password_hash, usuario_creador) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, lastNameP, lastNameM, email, phoneNumber, hashedPassword, usuario_creador]
    );

    res.status(201).json({
      id_user: result.insertId,
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
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(500).json({ error: `Fallo al crear usuario: ${error.message}` });
    }
  }
})



// ----------------------------- CONSULTA PARA EL DASHBOARD -------------------------------- //

// Consulta para para los cards superiores
app.get('/api/dashboard/estadisticas', async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN avance = 100 THEN 1 END) AS tareasCompletadas,
        COUNT(CASE WHEN avance > 0 AND avance < 100 THEN 1 END) AS tareasEnProceso,
        COUNT(*) AS totalActividades
      FROM actividades      
    `)
    res.json(result[0])
  } catch (error) {
    console.error('Error al obtener actividades:', error.message)
    res.status(500).json({ error: 'Error al obtener actividades' })
  }
})

// Horas y asistencias por usuario
app.get('/api/horas/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [horasDiarias] = await pool.query(`
      SELECT 
        DATE(r.fecha_actualizacion) AS dia,
        SUM(r.horas_trabajadas) AS horas_totales,
        SUM(CASE WHEN r.es_hora_extra = 1 THEN r.horas_trabajadas ELSE 0 END) AS horas_extra,
        COUNT(DISTINCT DATE(r.fecha_actualizacion)) AS dias_asistencia,
        CASE WHEN SUM(r.horas_trabajadas) < 8 THEN 1 ELSE 0 END AS incumple_dia
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = ?
      GROUP BY dia
      ORDER BY dia ASC
    `, [userId]);

    const [horasSemanales] = await pool.query(`
      SELECT 
          YEAR(r.fecha_actualizacion) AS anio,
          WEEK(r.fecha_actualizacion, 1) AS semana,
          -- Calcular lunes de la semana
          DATE_FORMAT(
              DATE_SUB(r.fecha_actualizacion, INTERVAL (DAYOFWEEK(r.fecha_actualizacion) - 2) DAY),
              '%d-%m'
          ) AS inicio_semana,
          -- Calcular viernes de la semana
          DATE_FORMAT(
              DATE_ADD(
                  DATE_SUB(r.fecha_actualizacion, INTERVAL (DAYOFWEEK(r.fecha_actualizacion) - 2) DAY),
                  INTERVAL 4 DAY
              ),
              '%d-%m'
          ) AS fin_semana,
          SUM(r.horas_trabajadas) AS horas_totales,
          SUM(CASE WHEN r.es_hora_extra = 1 THEN r.horas_trabajadas ELSE 0 END) AS horas_extra,
          COUNT(DISTINCT DATE(r.fecha_actualizacion)) AS dias_asistencia,
          CASE WHEN SUM(r.horas_trabajadas) < 40 THEN 1 ELSE 0 END AS incumple_semana,
          ROUND((SUM(r.horas_trabajadas) / 40) * 100, 2) AS porcentaje_meta
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = ?
      GROUP BY anio, semana
      ORDER BY anio ASC, semana ASC;
    `, [userId]);

    res.json({ horasDiarias, horasSemanales });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar horas y asistencias' });
  }
});

// Horas y asistencias por equipo
// app.get('/api/horas-equipo/:adminId', async (req, res) => {
//   const { adminId } = req.params;
//   try {
//     const [horasDiarias] = await pool.query(`
//       SELECT 
//         DATE(r.fecha_actualizacion) AS dia,
//         SUM(r.horas_trabajadas) AS horas_totales,
//         SUM(CASE WHEN r.es_hora_extra = 1 THEN r.horas_trabajadas ELSE 0 END) AS horas_extra
//       FROM registro_actividad r
//       JOIN actividades a ON r.id_actividad = a.id_activities
//       JOIN usuarios u ON a.usuario_asignado = u.id_user
//       WHERE u.usuario_creador = ?
//       GROUP BY dia
//       ORDER BY dia ASC
//     `, [adminId]);

//     const [horasSemanales] = await pool.query(`
//       SELECT 
//         YEAR(r.fecha_actualizacion) AS anio,
//         WEEK(r.fecha_actualizacion, 1) AS semana,
//         SUM(r.horas_trabajadas) AS horas_totales,
//         SUM(CASE WHEN r.es_hora_extra = 1 THEN r.horas_trabajadas ELSE 0 END) AS horas_extra,
//         ROUND((SUM(r.horas_trabajadas)/(COUNT(DISTINCT u.id_user)*40))*100,2) AS porcentaje_meta
//       FROM registro_actividad r
//       JOIN actividades a ON r.id_actividad = a.id_activities
//       JOIN usuarios u ON a.usuario_asignado = u.id_user
//       WHERE u.usuario_creador = ?
//       GROUP BY anio, semana
//       ORDER BY anio ASC, semana ASC
//     `, [adminId]);

//     res.json({ horasDiarias, horasSemanales });
//   } catch (error) {
//     res.status(500).json({ error: 'Error al cargar horas y asistencias del equipo' });
//   }
// });

// Productividad y avance por usuario
app.get('/api/productividad/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [summary] = await pool.query(`
       SELECT
          YEAR(a.fecha_creacion) AS anio,
          WEEK(a.fecha_creacion, 1) AS semana,
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
      WHERE a.usuario_asignado = ?
      GROUP BY anio, semana
      ORDER BY anio DESC, semana DESC;
      `, [userId])

    const [weekly] = await pool.query(`
      SELECT 
        YEAR(r.fecha_actualizacion) AS anio,
        WEEK(r.fecha_actualizacion, 1) AS semana,
        ROUND(AVG(a.avance),2) AS promedio_avance
      FROM actividades a
      JOIN registro_actividad r ON a.id_activities = r.id_actividad
      WHERE a.usuario_asignado = ?
      GROUP BY anio, semana
      ORDER BY anio ASC, semana ASC
    `, [userId])

    res.json({ ...summary[0], weekly });
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar productividad' });
  }
});

// Productividad y avance por equipo
// app.get('/api/productividad-equipo/:adminId', async (req, res) => {
//   const { adminId } = req.params;
//   try {
//     const [data] = await pool.query(`
//       SELECT 
//         COUNT(a.id_activities) AS total_tareas,
//         SUM(CASE WHEN a.avance=100 THEN 1 ELSE 0 END) AS tareas_completadas,
//         ROUND(AVG(a.avance),2) AS promedio_avance,
//         SUM(r.horas_trabajadas) AS horas_invertidas
//       FROM actividades a
//       JOIN registro_actividad r ON a.id_activities = r.id_actividad
//       JOIN usuarios u ON a.usuario_asignado = u.id_user
//       WHERE u.usuario_creador = ?
//     `, [adminId]);

//     res.json(data[0]);
//   } catch (error) {
//     res.status(500).json({ error: 'Error al cargar productividad del equipo' });
//   }
// });




// ------------------------- GESTIÓN DE USUARIOS ----------------------------- //

// Obtener todos los usuarios creados por un admin
app.get('/api/users/:usuario_creador', async (req, res) => {
  const { usuario_creador } = req.params;
  try {
    const [users] = await pool.query(`
      SELECT 
        id_user AS id_user,
        nombre AS name,
        paterno AS lastNameP,
        materno AS lastNameM,
        email,
        telefono AS phoneNumber,
        rol,
        DATE_FORMAT(fecha_creacion, "%d/%m/%Y") AS fecha_creacion
      FROM usuarios WHERE usuario_creador = ?
    `, [usuario_creador]);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener lista de trabajadores asociados a un administrador
app.get('/api/usuarios/trabajadores/:usuario_creador', async (req, res) => {
  const {usuario_creador} = req.params

  try {
    const [rows] = await pool.query(`
      SELECT id_user, nombre, paterno, materno
      FROM usuarios
      WHERE rol = 'trabajador' AND usuario_creador = ?`,
      [usuario_creador] 
    )
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener trabajadores:', error)
    res.status(500).json({ error: 'No se puedo obtener la lista de los trabajadores' });
  }
})

// Eliminar un usuario por su ID
app.put('/api/users/delete/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE id_user = ?', [id]
    )
    if (result.affectedRows === 0) {
      return res.status(409).json({ error:'Usuario no encontrado' })
    }
    const [rows] = await pool.query('SELECT * FROM usuarios')
    if (rows.length === 0) {
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
    const [result] = await pool.query(
      `INSERT INTO proyectos (name_proyect, descripcion) VALUES (?, ?)`,
      [project, description]
    )
    res.status(201).json({
      id_proyecto: result.insertId,
      project,
      description
    })
  } catch (error) {
    console.error('Error al guardar proyecto', error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'No se puede crear'})
    } else {
      res.status(500).json({ error: `Fallo al crear proyecto: ${error.message}`})
    }
  }
})

// Obtener todos los proyectos
app.get('/api/project', async (req, res) => {
  try {
    const [project] = await pool.query(
      `SELECT
        id_proyecto as id_project,
        name_proyect as name_project,
        descripcion as description 
        FROM proyectos`
    )
    res.json(project)
  } catch (error) {
    console.error('Error fetching projects:', error.message)
    res.status(500).json({ error: 'Error al obtener proyectos'})
  }
})

// Actualizar un proyecto existente
app.put('/api/project/:id', async (req, res) => {
  // console.log('PUT /api/project/:id alcanzado')
  const { id } = req.params
  const { project, description } = req.body
  try {
    const [result] = await pool.query(
      'UPDATE proyectos SET name_proyect = ?, descripcion = ? WHERE id_proyecto = ?',
      [project, description, id]
    )
    if (result.affectedRows === 0){
      return res.status(404).json({ error: 'Proyecto no encontrado'})
    }

    const [rows] = await pool.query('SELECT * FROM proyectos WHERE id_proyecto = ?', [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto actualizado no encontrado' })
    }
    res.json({ message: 'Actualizado con exito', updatedProject: rows[0]})
    
  } catch (error) {
    console.error('Error al actualizar:', error)
    res.status(500).json({ error: 'Error del servidor'})
  }
})



// -------------------------- GESTIÓN DE ACTIVIDADES ---------------------------- //

// Obtener todas las actividades (con nombre de usuario y proyecto)
app.get('/api/tasks', async (req, res) => {
  try {
    const [task] = await pool.query(`
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
        DATE_FORMAT(a.fecha_creacion, "%d/%m/%Y") AS creation,
        a.prioridad,
        DATE_FORMAT(fecha_limite, "%d/%m/%Y") AS limited
      FROM actividades a
      INNER JOIN usuarios u ON a.usuario_asignado = u.id_user
      INNER JOIN proyectos p ON a.proyecto = p.id_proyecto

    `)
    res.json(task)
  } catch (error) {
    console.error('Error fetching tasks:', error.message)
    res.status(500).json({ error: 'Error al obtener actividades'})
  }
})

// Crear una nueva actividad para un usuario (tambien creando notificación
app.post('/api/tasks', async (req, res) => {
  const { usuario_id, proyecto_id, actividad, descripcion, prioridad, fecha_limite, usuario_creador } = req.body;
  if (!prioridad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios'})
  } try {
    const [result] = await pool.query(
      `INSERT INTO actividades (proyecto, actividad, descripcion, usuario_asignado, prioridad, fecha_limite, usuario_creador, avance, horas_trabajadas) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [proyecto_id, actividad, descripcion, usuario_id, prioridad, fecha_limite, usuario_creador, 0, 0]
    )

    const mensaje = `te asignó una nueva actividad`
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, tipo, id_creador, id_actividad) VALUES (?, ?, 'asignacion', ?, ?)`,
      [usuario_id, mensaje, usuario_creador, result.insertId]
    )


    res.status(201).json({
      id_activities: result.insertId,
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
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'No se pudo asignar'})
    } else {
      res.status(500).json({ error: `Fallo al asignar actividad: ${error.message}`})
    }
  }
})

// Actualizar actividad (nombre, descripción, prioridad, fecha Límite)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params
  const updates = {}
  if(req.body.fecha_limite) updates.fecha_limite = req.body.fecha_limite
  if(req.body.actividad) updates.actividad = req.body.actividad
  if(req.body.descripcion) updates.descripcion = req.body.descripcion
  if(req.body.prioridad) updates.prioridad = req.body.prioridad

  try {
    const [result] = await pool.query(
      'UPDATE actividades SET ? WHERE id_activities = ? ', [updates, id]
    )
    if (result.affectedRows === 0) {
      return res.status(409).json({ error: 'Proyecto actualizado no encontrado' })
    }

    const [rows] = await pool.query('SELECT * FROM actividades WHERE id_activities = ?', [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
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
      'DELETE FROM registro_actividad WHERE id_actividad = ?', [id]
    )

    await pool.query(
      'DELETE FROM actividades WHERE id_activities = ?', [id]
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
    const [rows] = await pool.query(`
      SELECT SUM(r.horas_trabajadas) AS total_horas
      FROM registro_actividad r
      JOIN actividades a ON r.id_actividad = a.id_activities
      WHERE a.usuario_asignado = ?
      AND DATE(r.fecha_actualizacion) = CURDATE()
    `, [id])
    res.json({ toal_horas: rows[0].total_horas || 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al consultar horas del día' })
  }
})

// Guardar nueva Avtividad
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

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.query(`
      INSERT INTO actividades (
        proyecto, actividad, descripcion, prioridad,
        fecha_creacion, usuario_asignado, avance, horas_trabajadas, fecha_limite
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, NOW())`,
      [proyecto_id, actividad, descripcion, prioridad, usuario_creador, avance, horas]  
    )
    const idActividad = result.insertId

    // Insertar en registro_actividad
    await connection.query(`
      INSERT INTO registro_actividad (id_actividad, avance, horas_trabajadas, fecha_actualizacion)
        VALUES (?, ?, ?, NOW())    
    `, [idActividad, avance, horas])

    await connection.commit()

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
    await connection.rollback()
    console.error('Error al asignar actividad y registrar avance:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'No se puedo asignar, entrada duplicada' })
    } else {
      res.status(500).json({ error: `Fallo al asignar actividad: ${error.message}`})
    }
  } finally {
    connection.release()
  }
})

// Actualizar actividades en el modal de admin
app.put('/api/actividades/:id', async (req, res) => {
  const { id } = req.params
  const { actividad, descripcion } = req.body

  try {
    const [result] = await pool.query(
      'UPDATE actividades SET actividad = ?, descripcion = ? WHERE id_activities = ?',
      [actividad, descripcion, id]
    )

    if (result.affectedRows === 0) {
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

    // await pool.query(`
    //   UPDATE actividades SET 
    //     avance = ?, horas_trabajadas = ?
    //   WHERE id_activities = ?
    // `, [avance, horas_trabajadas, id])

    await pool.query(`
      INSERT INTO registro_actividad (id_actividad, horas_trabajadas, avance, fecha_actualizacion)
        VALUES (?, ?, ?, NOW())`,
      [id, horas_trabajadas, avance]
    )

    // Obtener la suma total de horas trabajadas
    const [[{ totalHoras }]] = await pool.query(`
      SELECT SUM(horas_trabajadas) AS totalHoras
      FROM registro_actividad
      WHERE id_actividad = ? 
    `, [id])

    // Actualizar actividades con la suma de horas y fecha limite
    await pool.query(`
      UPDATE actividades
      SET
        horas_trabajadas = ?,
        fecha_limite = NOW(),
        avance = ?
      WHERE id_activities = ?
    `, [totalHoras || 0, avance, id])



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
    const [tasks] = await pool.query(`
      SELECT
        a.id_activities,
        a.actividad,
        a.descripcion,
        a.avance,
        a.prioridad,
        a.fecha_creacion,
        a.fecha_limite,
        p.name_proyect,
        IFNULL(SUM(r.horas_trabajadas), 0) AS horas_trabajadas
      FROM actividades a
      LEFT JOIN registro_actividad r ON a.id_activities = r.id_actividad
      LEFT JOIN proyectos p ON a.proyecto = p.id_proyecto
      WHERE a.usuario_asignado = ?
      GROUP BY a.id_activities, p.name_proyect
    `, [id_usuario]);
      res.json(tasks)
  } catch (error) {
    console.error('Error al obtener actividades:', error.message);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

// Consultas para las estadisticas de actividades MyActivitiesView
app.get('/api/estadisticas/:idUser', async (req, res) => {
  const { idUser } = req.params
  try {
    const [result] = await pool.query(`
      SELECT
        COUNT(CASE WHEN avance = 100 THEN 1 END) AS tareasCompletadas,
        COUNT(CASE WHEN avance < 100 THEN 1 END) AS enProgreso,
        COUNT(*) AS tareasTotales
      FROM actividades
      WHERE usuario_asignado = ?
    `, [idUser])
    res.json(result[0])
  } catch (error) {
    console.error('Error al obtener datos:', error.message)
    res.status(500).json({ error: 'Error al obtener estadisticas' })
  }
})

// Consulta para el progreso de actividades el avance de las actividades
app.get('/api/registros-avances/:idActividad', async (req, res) => {
  const { idActividad } = req.params
  try {
    const [rows] = await pool.query(`
      SELECT avance, fecha_actualizacion
      FROM registro_actividad
      WHERE id_actividad = ?
      ORDER BY fecha_actualizacion DESC
    `, [idActividad])
    
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al obtener los registros de avance' })
  }
})

// Función para generar reporte
async function generarReporteQuincenalPDF(usuarioId) {
  try {
    const [[userInfo]] = await pool.query(`
      SELECT 
        u.nombre AS nombre,
        u.paterno AS paterno,
        u.materno AS materno,
        d.nombre_dependencia AS dependencia
      FROM usuarios u
      LEFT JOIN dependencias d ON u.dependencia_id = d.id_dependencia
      WHERE u.id_user = ?
    `, [usuarioId]);

    const nombreCompleto = `${userInfo?.nombre || ''} ${userInfo?.paterno || ''} ${userInfo?.materno || ''}`.trim();

    // Generar iniciales
    const iniciales = `${userInfo?.nombre?.charAt(0) || ''}${userInfo?.paterno?.charAt(0) || ''}${userInfo.materno?.charAt(0) || ''}`.toUpperCase()

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

    const [rows] = await pool.query(`
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
        AND r.fecha_actualizacion BETWEEN ? AND ?
      WHERE a.usuario_asignado = ?
        AND a.estado <> 'rechazada'
      GROUP BY p.name_proyect, a.id_activities
      ORDER BY p.name_proyect, a.fecha_creacion
    `, [fechaInicioStr, fechaFinStr, usuarioId]);

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
      VALUES (?, ?, ?, ?, NOW())
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
    const [usuarios] = await pool.query(`
      SELECT id_user FROM usuarios WHERE activo = 1
    `)
    return usuarios.map(u => ({ id_user: u.id_user }))
  } catch (error) {
    console.error('Error en cargarUsuarios:', error)
    throw error
  }
}

function configuracionGenerarReportes() {
  cron.schedule('59 23 * * *', async () => {
    try {
      const hoy = new Date();
      const dia = hoy.getDate();
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();

      if (dia !== 15 && dia !== ultimoDiaMes) return

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
    const [rows] = await pool.query(
      'SELECT * FROM reportes_generados WHERE usuario_id = ? ORDER BY fecha_generacion DESC',
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

    const reportesFormateados = rows.map(r => {
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

  const { id } = req.params
  try {
    const [rows] = await pool.query(
      'SELECT ruta, nombre_archivo FROM reportes_generados WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reporte no encontrado' })
    }

    const { ruta, nombre_archivo } = rows[0]
    res.download(ruta, nombre_archivo) // envía el archivo
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al descargar el reporte' })
  }
})


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
    await pool.query('UPDATE usuarios SET imagen = ? WHERE id_user = ?', [ruta, id]);
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
    const [rows] = await pool.query('SELECT imagen FROM usuarios WHERE id_user = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const imagen = rows[0].imagen;
    res.json({ success: true, imagen });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar datos del usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, paterno, materno, email, telefono } = req.body

  try {
    const [result] = await pool.query(`
      UPDATE usuarios SET
        nombre = ?,
        paterno = ?,
        materno = ?,
        email = ?,
        telefono = ?
      WHERE id_user = ?`, 
      [nombre, paterno, materno, email, telefono, id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    const [rows] = await pool.query(`SELECT * FROM usuarios WHERE id_user = ?`, [id])
    res.json({ message: 'Usuaro actualizado con exito' })
  } catch (error) {
    console.error('Error al actualiza usuario:', error.message, error.stack)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Verificar password actual
app.post('/api/usuarios/verificar-password/:id', async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_user = ?', [id])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    const user = rows[0]
    // console.log('password recibido', password)
    // console.log('password almacenado', user.password_hash)
    const esValida = await bcrypt.compare(password, user.password_hash)

    res.json({ success: true, esValida })
  } catch (error) {
    console.error('Error al verificar la contraseña:', error)
    res.status(500).json({ success: false, message: 'Error del servidor' })
  }
})

// Actualizar contraseña
app.put('/api/usuarios/:id/password', async (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword } = req.body

  try {
    const [rows] = await pool.query('SELECT password_hash FROM usuarios WHERE id_user = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const hashedPassword = rows[0].password_hash

    console.log('* Contraseña ingresada en el input:', currentPassword)
    console.log('* Hash almacenado en la BD:', hashedPassword)

    const isMatch = await bcrypt.compare(currentPassword, hashedPassword)

    console.log('* Coinciden?', isMatch)

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'La contraseña actual no es correcta' })
    }

    const saltRounds = 10
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds)

    await pool.query('UPDATE usuarios SET password_hash = ? WHERE id_user = ?', [newHashedPassword, id])
    
    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' })
   
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error)
    return res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
})


configuracionGenerarReportes();
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});