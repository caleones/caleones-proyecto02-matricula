const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware de autenticación JWT.
 * Verifica la validez del token enviado en la cabecera Authorization.
 * Si es válido, agrega el usuario (id y rol) al objeto req.
 * Si no, responde con error 401.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
function authenticate(req, res, next) {
  // Obtiene la cabecera Authorization de la solicitud
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Responde con error 401 si no se proporciona la cabecera
    return res.status(401).json({ success: false, error: "Token requerido" });
  }

  // Extrae el token de la cabecera Authorization
  const token = authHeader.split(" ")[1];
  try {
    // Verifica la validez del token utilizando la clave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Agrega los datos del usuario (id y rol) al objeto req para uso posterior
    req.user = { id: payload.sub, role: payload.role };

    // Llama al siguiente middleware o controlador
    next();
  } catch {
    // Responde con error 401 si el token es inválido
    res.status(401).json({ success: false, error: "Token inválido" });
  }
}

// Exporta el middleware para que pueda ser utilizado en otros módulos
module.exports = { authenticate };
