const Matricula = require("../models/Matricula");

/**
 * Lista las matrículas activas según los filtros proporcionados.
 * Solo se incluyen matrículas cuyo estado 'activo' sea true.
 *
 * @param {Object} filter - Filtros opcionales: estudiante, materia, semestre.
 * @returns {Promise<Array>} Lista de matrículas que cumplen con los filtros y están activas.
 */
async function listMatriculas(filter = {}) {
  // Inicializa el filtro con el estado 'activo' para listar solo matrículas activas
  const finalFilter = { activo: true };

  // Agrega filtros opcionales si se proporcionan
  if (filter.estudiante) finalFilter.estudiante = filter.estudiante; // Filtra por ID de estudiante
  if (filter.materia) finalFilter.materia = filter.materia; // Filtra por ID de materia
  if (filter.semestre) finalFilter.semestre = filter.semestre; // Filtra por semestre

  // Realiza la consulta en la base de datos con los filtros aplicados
  return await Matricula.find(finalFilter);
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { listMatriculas };
