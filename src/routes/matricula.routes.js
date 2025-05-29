const router = require("express").Router();
const {
  createMatriculaController,
  getMatriculaByIdController,
  listMatriculasController,
  updateMatriculaController,
  deleteMatriculaController,
} = require("../controllers/matricula.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validateRole } = require("../middlewares/role.middleware");

// Middleware global para autenticar todas las rutas de matrícula
router.use(authenticate);

/**
 * Ruta para crear una matrícula.
 * Solo accesible para usuarios con rol "admin" o "estudiante".
 */
router.post("/", validateRole(["admin", "estudiante"]), async (req, res) => {
  const { status, body } = await createMatriculaController({
    user: req.user,
    body: req.body,
  });
  res.status(status).json(body);
});

/**
 * Ruta para listar matrículas.
 * Accesible para usuarios con rol "admin", "profesor" o "estudiante".
 */
router.get(
  "/",
  validateRole(["admin", "profesor", "estudiante"]),
  async (req, res) => {
    const { status, body } = await listMatriculasController({
      user: req.user,
      query: req.query,
    });
    res.status(status).json(body);
  }
);

/**
 * Ruta para obtener una matrícula por ID.
 * Accesible para usuarios con rol "admin", "profesor" o "estudiante".
 */
router.get(
  "/:id",
  validateRole(["admin", "profesor", "estudiante"]),
  async (req, res) => {
    const { status, body } = await getMatriculaByIdController({
      user: req.user,
      params: req.params,
    });
    res.status(status).json(body);
  }
);

/**
 * Ruta para actualizar una matrícula.
 * Solo accesible para usuarios con rol "profesor" o "admin".
 */
router.put("/:id", validateRole(["profesor", "admin"]), async (req, res) => {
  const { status, body } = await updateMatriculaController({
    user: req.user,
    params: req.params,
    body: req.body,
  });
  res.status(status).json(body);
});

/**
 * Ruta para eliminar (desactivar) una matrícula.
 * Solo accesible para usuarios con rol "admin" o "estudiante".
 */
router.delete(
  "/:id",
  validateRole(["admin", "estudiante"]),
  async (req, res) => {
    const { status, body } = await deleteMatriculaController({
      user: req.user,
      params: req.params,
    });
    res.status(status).json(body);
  }
);

// Exporta el router para que pueda ser utilizado en otros módulos
module.exports = router;
