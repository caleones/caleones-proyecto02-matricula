const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Configuración de la conexión a la base de datos MongoDB.
 * Utiliza las variables de entorno para obtener la URI de conexión.
 * La conexión solo se establece si el entorno no es "test".
 */
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Utiliza el nuevo analizador de URL de MongoDB
      useUnifiedTopology: true, // Habilita el motor de administración de conexiones unificado
    })
    .then(() => console.log("MongoDB conectado exitosamente")) // Mensaje en caso de éxito
    .catch((err) => console.error("Error al conectar a MongoDB", err)); // Manejo de errores en la conexión
}
