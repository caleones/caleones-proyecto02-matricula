/**
 * Middleware para validar el rol del usuario.
 * Verifica si el rol del usuario está incluido en los roles permitidos.
 * Si no está permitido, responde con un error 403 (No autorizado).
 *
 * @param {string[]} allowedRoles - Lista de roles permitidos.
 * @returns {Function} Middleware que valida el rol del usuario.
 */
function validateRole(allowedRoles) {
  return (req, res, next) => {
    // Verifica si el rol del usuario está en la lista de roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      // Responde con error 403 si el rol no está permitido
      return res.status(403).json({ success: false, error: "No autorizado" });
    }

    // Llama al siguiente middleware o controlador si el rol es válido
    next();
  };
}

// Exporta el middleware para que pueda ser utilizado en otros módulos
module.exports = { validateRole };
