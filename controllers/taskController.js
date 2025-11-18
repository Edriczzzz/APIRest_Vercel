import pool from "../db.js";

export const getTasks = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM task");
    
    // Convertir status de 0/1 a false/true
    const tasks = rows.map(task => ({
      ...task,
      status: task.status === 1
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error("Error en getTasks:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM task WHERE id = ?", 
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    const task = { ...rows[0], status: rows[0].status === 1 };
    res.json(task);
  } catch (error) {
    console.error("Error en getTask:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { name, deadline, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }
    
    const [result] = await pool.query(
      "INSERT INTO task (name, deadline, status) VALUES (?, ?, ?)",
      [name, deadline || null, status ? 1 : 0]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      deadline: deadline || null,
      status: status || false
    });
  } catch (error) {
    console.error("Error en createTask:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { name, deadline, status } = req.body;
    
    // Verificar que la tarea existe
    const [existing] = await pool.query(
      "SELECT * FROM task WHERE id = ?",
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    await pool.query(
      "UPDATE task SET name = ?, deadline = ?, status = ? WHERE id = ?",
      [name, deadline || null, status ? 1 : 0, req.params.id]
    );
    
    res.json({ 
      message: "Tarea actualizada exitosamente",
      id: req.params.id
    });
  } catch (error) {
    console.error("Error en updateTask:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM task WHERE id = ?", 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error en deleteTask:", error);
    res.status(500).json({ message: error.message });
  }
};