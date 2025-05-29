/**
 * Calcula la nota final ponderada a partir de un arreglo de notas y sus porcentajes correspondientes.
 *
 * @param {number[]} notas - Arreglo de notas numéricas.
 * @param {number[]} porcentajes - Arreglo de porcentajes asociados a cada nota.
 * @returns {number} Nota final calculada según los pesos proporcionados.
 * @throws {Error} Si los argumentos no son arreglos o sus longitudes no coinciden.
 */
function calculateNotaFinal(notas, porcentajes) {
  // Verifica que ambos parámetros sean arreglos
  if (!Array.isArray(notas) || !Array.isArray(porcentajes)) {
    throw new Error("Notas y porcentajes deben ser arrays");
  }

  // Verifica que ambos arreglos tengan la misma longitud
  if (notas.length !== porcentajes.length) {
    throw new Error("El número de notas y porcentajes debe coincidir");
  }

  // Calcula la suma total de los porcentajes
  const sumaPesos = porcentajes.reduce((sum, p) => sum + p, 0);

  // Si la suma de los porcentajes es mayor a 1, se asume que están en formato porcentaje (0-100) y se normalizan
  const pesos =
    sumaPesos > 1
      ? porcentajes.map((p) => p / 100) // Convierte los porcentajes a valores entre 0 y 1
      : porcentajes; // Usa los porcentajes directamente si ya están en formato decimal

  // Calcula la nota final multiplicando cada nota por su peso y sumando los resultados
  return notas
    .map((n, i) => n * pesos[i]) // Multiplica cada nota por su peso correspondiente
    .reduce((sum, partial) => sum + partial, 0); // Suma los productos para obtener la nota final
}

// Exporta la función para que pueda ser utilizada en otros módulos
module.exports = { calculateNotaFinal };
