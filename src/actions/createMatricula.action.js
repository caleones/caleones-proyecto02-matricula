const Matricula = require("../models/Matricula");
const { getPorcentajeEvaluaciones } = require("../services/materia.service");
const { calculateNotaFinal } = require("./calculateNotaFinal.action");

/**
 * Crea una nueva matrícula para un estudiante en una materia y semestre determinados.
 * Valida los datos de entrada, obtiene los porcentajes de evaluación de la materia,
 * calcula la nota final y guarda la matrícula en la base de datos.
 *
 * @param {Object} params - Parámetros para la matrícula.
 * @param {string} params.estudiante - ID del estudiante.
 * @param {string} params.materia - ID de la materia.
 * @param {string} params.semestre - Semestre de la matrícula.
 * @param {number[]} [params.notas] - Notas obtenidas por el estudiante (opcional).
 * @returns {Promise<Object>} La matrícula creada.
 * @throws {Error} Si los datos de entrada son inválidos o falla alguna operación.
 */
async function createMatricula({ estudiante, materia, semestre, notas }) {
  // Validación de campos obligatorios
  if (!estudiante || !materia || !semestre) {
    throw new Error("Los campos estudiante, materia y semestre son requeridos");
  }

  let porcentajes;
  try {
    // Obtiene los porcentajes de evaluación de la materia desde el servicio
    porcentajes = await getPorcentajeEvaluaciones(materia);
  } catch (err) {
    // Manejo de errores al obtener los porcentajes
    throw new Error(
      "No se pudo obtener porcentajes de Materias: " + err.message
    );
  }

  // Verifica que los porcentajes sean válidos (deben ser un arreglo no vacío)
  if (!Array.isArray(porcentajes) || porcentajes.length === 0) {
    throw new Error("Porcentajes de evaluaciones inválidos");
  }

  let notasFinal;
  if (notas !== undefined) {
    // Valida que las notas sean un arreglo y coincidan en longitud con los porcentajes
    if (!Array.isArray(notas)) {
      throw new Error("notas debe ser un array");
    }
    if (notas.length !== porcentajes.length) {
      throw new Error("El número de notas y de porcentajes debe coincidir");
    }
    // Valida que cada nota esté en el rango permitido (0 a 5)
    if (notas.some((n) => typeof n !== "number" || n < 0 || n > 5)) {
      throw new Error("Cada nota debe ser un número entre 0 y 5");
    }
    notasFinal = notas;
  } else {
    // Si no se proporcionan notas, inicializa con ceros para cada porcentaje
    notasFinal = porcentajes.map(() => 0);
  }

  // Calcula la nota final ponderada utilizando la función auxiliar
  const notaFinal = calculateNotaFinal(notasFinal, porcentajes);

  // Crea la nueva instancia de matrícula con los datos proporcionados
  const nuevaMatricula = new Matricula({
    estudiante, // ID del estudiante
    materia, // ID de la materia
    semestre, // Semestre de la matrícula
    notas: notasFinal, // Notas finales calculadas
    notaFinal, // Nota final ponderada
    activo: true, // Estado activo de la matrícula
  });

  // Guarda la matrícula en la base de datos y la retorna
  return await nuevaMatricula.save();
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { createMatricula };
