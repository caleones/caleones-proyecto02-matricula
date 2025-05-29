const Matricula = require("../models/Matricula");

/**
 * Obtiene una matrícula activa por su ID.
 * Solo se retornan matrículas cuyo estado 'activo' sea true.
 *
 * @param {string} id - ID de la matrícula a buscar.
 * @returns {Promise<Object|null>} La matrícula encontrada o null si no existe o está inactiva.
 */
async function getMatriculaById(id) {
  // Busca una matrícula activa en la base de datos por su ID
  return await Matricula.findOne({ _id: id, activo: true });
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { getMatriculaById };
