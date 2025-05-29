const Matricula = require("../models/Matricula");

/**
 * Desactiva (elimina lógicamente) una matrícula por su ID.
 * Cambia el estado 'activo' a false en lugar de eliminar el registro de la base de datos.
 *
 * @param {string} id - ID de la matrícula a desactivar.
 * @returns {Promise<Object>} La matrícula actualizada.
 * @throws {Error} Si la matrícula no se encuentra.
 */
async function deleteMatricula(id) {
  // Busca la matrícula por ID en la base de datos
  const matricula = await Matricula.findById(id);
  if (!matricula) {
    // Lanza un error si no se encuentra la matrícula
    throw new Error("Matrícula no encontrada");
  }

  // Marca la matrícula como inactiva cambiando el estado 'activo' a false
  matricula.activo = false;

  // Guarda los cambios en la base de datos
  await matricula.save();

  // Retorna la matrícula actualizada
  return matricula;
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { deleteMatricula };
