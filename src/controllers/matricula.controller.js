const { createMatricula } = require("../actions/createMatricula.action");
const { getMatriculaById } = require("../actions/getMatriculaById.action");
const { listMatriculas } = require("../actions/listMatriculas.action");
const { updateMatricula } = require("../actions/updateMatricula.action");
const { deleteMatricula } = require("../actions/deleteMatricula.action");
const { getMateriasPorProfesor } = require("../services/materia.service");

/**
 * Controlador para crear una matrícula.
 * Valida el rol del usuario y los datos requeridos antes de crear la matrícula.
 */
async function createMatriculaController({ user, body }) {
  const isAdmin = user.role === "admin";
  const isStudent = user.role === "estudiante";

  // Verifica que el usuario tenga permisos para crear una matrícula
  if (!isAdmin && !isStudent) {
    return { status: 403, body: { success: false, error: "No autorizado" } };
  }

  // Si el usuario es estudiante, valida que solo pueda crear su propia matrícula
  if (isStudent && body.estudiante && body.estudiante !== user.id) {
    return { status: 403, body: { success: false, error: "No autorizado" } };
  }

  // Determina el ID del estudiante según el rol del usuario
  const estudianteId = isStudent ? user.id : body.estudiante;
  if (!estudianteId) {
    return {
      status: 400,
      body: { success: false, error: "Admin debe indicar el ID de estudiante" },
    };
  }

  try {
    // Crea la matrícula utilizando los datos proporcionados
    const nueva = await createMatricula({
      estudiante: estudianteId,
      materia: body.materia,
      semestre: body.semestre,
      notas: body.notas,
    });
    return { status: 201, body: { success: true, data: nueva } };
  } catch (e) {
    // Manejo de errores durante la creación de la matrícula
    return { status: 400, body: { success: false, error: e.message } };
  }
}

/**
 * Controlador para obtener una matrícula por ID.
 * Valida el acceso según el rol del usuario.
 */
async function getMatriculaByIdController({ user, params }) {
  try {
    // Busca la matrícula por ID
    const mat = await getMatriculaById(params.id);
    if (!mat) {
      return { status: 404, body: { success: false, error: "No encontrada" } };
    }

    // Valida el acceso para estudiantes
    if (user.role === "estudiante" && user.id !== String(mat.estudiante)) {
      return { status: 403, body: { success: false, error: "No autorizado" } };
    }

    // Valida el acceso para profesores
    if (user.role === "profesor") {
      const materias = await getMateriasPorProfesor(user.id);
      const misIds = materias.map((m) => String(m._id));
      if (!misIds.includes(String(mat.materia))) {
        return {
          status: 403,
          body: { success: false, error: "No autorizado" },
        };
      }
    }

    return { status: 200, body: { success: true, data: mat } };
  } catch (e) {
    // Manejo de errores durante la obtención de la matrícula
    return { status: 500, body: { success: false, error: e.message } };
  }
}

/**
 * Controlador para listar matrículas.
 * Aplica filtros según el rol del usuario y los parámetros de consulta.
 */
async function listMatriculasController({ user, query }) {
  try {
    const filter = { activo: true };

    // Aplica filtros según el rol del usuario
    if (user.role === "estudiante") {
      filter.estudiante = user.id;
    }
    if (user.role === "profesor") {
      const materias = await getMateriasPorProfesor(user.id);
      filter.materia = { $in: materias.map((m) => m._id) };
    }

    // Aplica filtros adicionales según los parámetros de consulta
    if (query.semestre) filter.semestre = query.semestre;
    if (query.materia) filter.materia = query.materia;

    // Lista las matrículas que cumplen con los filtros
    const list = await listMatriculas(filter);
    return { status: 200, body: { success: true, data: list } };
  } catch (e) {
    // Manejo de errores durante la consulta de matrículas
    return { status: 500, body: { success: false, error: e.message } };
  }
}

/**
 * Controlador para actualizar una matrícula.
 * Solo permite que administradores o profesores actualicen las notas.
 */
async function updateMatriculaController({ user, params, body }) {
  const isAdmin = user.role === "admin";
  const isProfesor = user.role === "profesor";

  // Verifica que el usuario tenga permisos para actualizar una matrícula
  if (!isAdmin && !isProfesor) {
    return { status: 403, body: { success: false, error: "No autorizado" } };
  }

  // Validaciones específicas para profesores
  if (isProfesor) {
    if (!body.notas || Object.keys(body).length !== 1) {
      return {
        status: 403,
        body: { success: false, error: "Sólo puede modificar notas" },
      };
    }

    const matricula = await getMatriculaById(params.id);
    if (!matricula) {
      return { status: 404, body: { success: false, error: "No encontrada" } };
    }
    const materias = await getMateriasPorProfesor(user.id);
    const ids = materias.map((m) => String(m._id));
    if (!ids.includes(String(matricula.materia))) {
      return { status: 403, body: { success: false, error: "No autorizado" } };
    }
  } else {
    // Validaciones específicas para administradores
    if (!body.notas || Object.keys(body).length !== 1) {
      return {
        status: 400,
        body: { success: false, error: "Sólo se puede actualizar notas" },
      };
    }
  }

  try {
    // Actualiza la matrícula con las notas proporcionadas
    const updated = await updateMatricula(params.id, body);
    return { status: 200, body: { success: true, data: updated } };
  } catch (e) {
    // Manejo de errores durante la actualización de la matrícula
    return { status: 400, body: { success: false, error: e.message } };
  }
}

/**
 * Controlador para eliminar (desactivar) una matrícula.
 * Solo permite la acción a administradores o al propio estudiante.
 */
async function deleteMatriculaController({ user, params }) {
  const isAdmin = user.role === "admin";
  const isStudent = user.role === "estudiante";

  // Verifica que el usuario tenga permisos para eliminar una matrícula
  if (!isAdmin && !isStudent) {
    return { status: 403, body: { success: false, error: "No autorizado" } };
  }

  // Validaciones específicas para estudiantes
  if (isStudent) {
    const mat = await getMatriculaById(params.id);
    if (!mat || String(mat.estudiante) !== user.id) {
      return { status: 403, body: { success: false, error: "No autorizado" } };
    }
  }

  try {
    // Desactiva la matrícula
    await deleteMatricula(params.id);
    return { status: 200, body: { success: true } };
  } catch (e) {
    // Manejo de errores durante la eliminación de la matrícula
    return { status: 500, body: { success: false, error: e.message } };
  }
}

// Exporta los controladores para que puedan ser utilizados en otros módulos
module.exports = {
  createMatriculaController,
  getMatriculaByIdController,
  listMatriculasController,
  updateMatriculaController,
  deleteMatriculaController,
};
