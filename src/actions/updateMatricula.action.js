const Matricula = require("../models/Matricula");
const { getPorcentajeEvaluaciones } = require("../services/materia.service");
const { calculateNotaFinal } = require("./calculateNotaFinal.action");

/**
 * Actualiza las notas de una matrícula activa y recalcula la nota final.
 *
 * @param {string} id - ID de la matrícula a actualizar.
 * @param {Object} updateData - Datos a actualizar (debe incluir un array de notas).
 * @returns {Promise<Object>} La matrícula actualizada.
 * @throws {Error} Si la matrícula no existe, está inactiva o los datos son inválidos.
 */
async function updateMatricula(id, updateData) {
  // Busca la matrícula activa por ID
  const matricula = await Matricula.findOne({ _id: id, activo: true });
  if (!matricula) {
    // Lanza un error si la matrícula no existe o está inactiva
    throw new Error("Matrícula no encontrada o inactiva");
  }

  // Valida que se envíe un array de notas válido
  if (!updateData.notas || !Array.isArray(updateData.notas)) {
    throw new Error("Debes enviar un array de notas");
  }
  if (updateData.notas.some((n) => typeof n !== "number" || n < 0 || n > 5)) {
    // Lanza un error si alguna nota no está en el rango permitido (0 a 5)
    throw new Error("Cada nota debe ser un número entre 0 y 5");
  }

  // Actualiza las notas en la matrícula
  matricula.notas = updateData.notas;

  let porcentajes;
  try {
    // Obtiene los porcentajes de evaluación de la materia
    porcentajes = await getPorcentajeEvaluaciones(matricula.materia.toString());
  } catch (err) {
    // Manejo de errores al obtener los porcentajes
    throw new Error(
      "No se pudo obtener porcentajes de Materias: " + err.message
    );
  }

  // Recalcula la nota final utilizando las notas actualizadas y los porcentajes
  matricula.notaFinal = calculateNotaFinal(matricula.notas, porcentajes);

  // Guarda y retorna la matrícula actualizada
  return await matricula.save();
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { updateMatricula };
