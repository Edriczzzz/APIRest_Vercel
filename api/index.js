import express from "express";
import cors from "cors";
import { login, register, getUsers, getUser, updateUser, deleteUser } from "../controllers/userController.js";
import { getTasks, getTask, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { verifyToken } from "../middleware/auth.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({ 
    message: "API de Tasks funcionando correctamente",
    endpoints: {
      auth: ["/api/login", "/api/register"],
      users: ["/api/users", "/api/users/:id"],
      tasks: ["/api/tasks", "/api/tasks/:id"]
    }
  });
});

// Rutas de autenticación (públicas)
app.post("/api/login", login);
app.post("/api/register", register);

// Rutas de usuarios (protegidas)
app.get("/api/users", verifyToken, getUsers);
app.get("/api/users/:id", verifyToken, getUser);
app.put("/api/users/:id", verifyToken, updateUser);
app.delete("/api/users/:id", verifyToken, deleteUser);

// Rutas de tareas (protegidas)
app.get("/api/tasks", verifyToken, getTasks);
app.get("/api/tasks/:id", verifyToken, getTask);
app.post("/api/tasks", verifyToken, createTask);
app.put("/api/tasks/:id", verifyToken, updateTask);
app.delete("/api/tasks/:id", verifyToken, deleteTask);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;