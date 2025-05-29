require("dotenv").config(); // Carga las variables de entorno desde el archivo .env
const express = require("express"); // Framework para crear el servidor HTTP
const cors = require("cors"); // Middleware para habilitar CORS
const helmet = require("helmet"); // Middleware para mejorar la seguridad HTTP
const matriculaRoutes = require("./routes/matricula.routes"); // Importa las rutas de matrícula
require("./database"); // Configura la conexión a la base de datos

const app = express(); // Crea una instancia de la aplicación Express

// Middlewares globales
app.use(cors()); // Habilita CORS para permitir solicitudes desde otros dominios
app.use(helmet()); // Agrega encabezados de seguridad HTTP
app.use(express.json()); // Habilita el análisis de JSON en las solicitudes

// Ruta de salud para verificar el estado del servidor
app.get("/health", (_, res) => res.sendStatus(200)); // Responde con un código 200 si el servidor está activo

// Rutas de la API para matrículas
app.use("/api/matriculas", matriculaRoutes); // Asocia las rutas de matrícula al prefijo /api/matriculas

// Inicia el servidor si este archivo es el módulo principal
if (require.main === module) {
  const PORT = process.env.PORT || 3000; // Obtiene el puerto desde las variables de entorno o usa el puerto 3000 por defecto
  app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`)); // Inicia el servidor y muestra un mensaje en la consola
}

// Exporta la instancia de la aplicación para pruebas o uso en otros módulos
module.exports = app;
