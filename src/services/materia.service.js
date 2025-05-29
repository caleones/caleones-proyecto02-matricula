const axios = require("axios");
require("dotenv").config();

/**
 * Obtiene los porcentajes de evaluación de una materia específica.
 * Realiza una solicitud GET al servicio externo de materias.
 *
 * @param {string} materiaId - ID de la materia.
 * @returns {Promise<Array>} Porcentajes de evaluación de la materia.
 * @throws {Error} Si la solicitud al servicio externo falla.
 */
async function getPorcentajeEvaluaciones(materiaId) {
  // Construye la URL para la solicitud al servicio externo
  const url = `${process.env.MATERIA_SERVICE_URL}/api/materias/${materiaId}`;

  // Realiza la solicitud GET al servicio externo
  const resp = await axios.get(url);

  // Retorna los porcentajes de evaluación obtenidos
  return resp.data.data.porcentajeEvaluaciones;
}

/**
 * Obtiene las materias asignadas a un profesor específico.
 * Realiza una solicitud GET al servicio externo de materias.
 *
 * @param {string} profesorId - ID del profesor.
 * @returns {Promise<Array>} Lista de materias asignadas al profesor.
 * @throws {Error} Si la solicitud al servicio externo falla.
 */
async function getMateriasPorProfesor(profesorId) {
  // Construye la URL para la solicitud al servicio externo
  const url = `${process.env.MATERIA_SERVICE_URL}/api/materias?profesor=${profesorId}`;

  // Realiza la solicitud GET al servicio externo
  const resp = await axios.get(url);

  // Retorna la lista de materias obtenida
  return resp.data.data;
}

// Exporta las funciones para que puedan ser utilizadas en otros módulos
module.exports = {
  getPorcentajeEvaluaciones,
  getMateriasPorProfesor,
};
