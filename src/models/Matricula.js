const mongoose = require("mongoose");

/**
 * Esquema de Mongoose para la colección de matrículas.
 * Representa la relación entre estudiantes, materias y sus evaluaciones.
 */
const MatriculaSchema = new mongoose.Schema(
  {
    // Referencia al estudiante (ID de la colección 'User')
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Referencia a la materia (ID de la colección 'Materia')
    materia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true,
    },

    // Semestre en el que se realiza la matrícula
    semestre: { type: String, required: true },

    // Array de notas obtenidas por el estudiante (valores entre 0 y 5)
    notas: [{ type: Number, min: 0, max: 5 }],

    // Nota final calculada (valor entre 0 y 5)
    notaFinal: { type: Number, min: 0, max: 5 },

    // Estado de la matrícula (activo/inactivo)
    activo: { type: Boolean, default: true },
  },
  {
    // Agrega campos de timestamp (createdAt y updatedAt) automáticamente
    timestamps: true,
  }
);

// Exporta el modelo de Mongoose para que pueda ser utilizado en otros módulos
module.exports = mongoose.model("Matricula", MatriculaSchema);
