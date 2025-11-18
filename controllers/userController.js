import jwt from "jsonwebtoken";
import pool from "../db.js";

// Login de usuario (SIN bcrypt - contraseña en texto plano)
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    // Buscar usuario en la base de datos
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario incorrecto" });
    }

    const user = rows[0];

    // Verificar contraseña (texto plano)
    if (password !== user.password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secret-default-key",
      { expiresIn: "24h" }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: error.message });
  }
};

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Verificar si el usuario ya existe
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, username + "@example.com", passwordHash]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      message: "Usuario registrado exitosamente"
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los usuarios (sin contraseñas)
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email FROM users"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por ID
export const getUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error en getUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    values.push(req.params.id);

    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({ message: error.message });
  }
};