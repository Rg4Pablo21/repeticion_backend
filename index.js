const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de conexión MySQL (ajusta usuario, contraseña y host según tu entorno)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '0521',
  database: 'examen_registros',
};

// Ruta para obtener todas las personas
app.get('/api/personas', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM personas ORDER BY id DESC');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// Ruta para crear persona
app.post('/api/personas', async (req, res) => {
  const { nombre, edad } = req.body;
  if (!nombre || !edad) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO personas (nombre, edad) VALUES (?, ?)',
      [nombre, edad]
    );
    await connection.end();

    // Retornar el objeto insertado con su id
    res.json({ id: result.insertId, nombre, edad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear persona' });
  }
});

// Ruta para eliminar persona por id
app.delete('/api/personas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM personas WHERE id = ?', [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json({ mensaje: 'Persona eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
