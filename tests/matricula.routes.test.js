const express = require("express");
const request = require("supertest");

// Mock de los controllers para aislar las pruebas de las rutas
jest.mock("../src/controllers/matricula.controller", () => ({
  createMatriculaController: jest.fn(),
  listMatriculasController: jest.fn(),
  getMatriculaByIdController: jest.fn(),
  updateMatriculaController: jest.fn(),
  deleteMatriculaController: jest.fn(),
}));

// Mock del middleware de autenticación: simula la extracción de rol y usuario desde los headers
jest.mock("../src/middlewares/auth.middleware", () => ({
  authenticate: (req, res, next) => {
    req.user = {
      id: req.headers["x-user-id"] || "u1",
      role: req.headers["x-role"] || "guest",
    };
    next();
  },
}));

const {
  createMatriculaController,
  listMatriculasController,
  getMatriculaByIdController,
  updateMatriculaController,
  deleteMatriculaController,
} = require("../src/controllers/matricula.controller");

const router = require("../src/routes/matricula.routes");

describe("Rutas /api/matriculas", () => {
  let app;

  // Configuración inicial antes de todas las pruebas
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/matriculas", router);
  });

  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /api/matriculas
  describe("POST /api/matriculas", () => {
    /**
     * Prueba que un administrador puede crear una matrícula.
     */
    it("201 éxito: admin crea matrícula", async () => {
      createMatriculaController.mockResolvedValue({
        status: 201,
        body: { success: true, data: { id: "m1" } },
      });
      const res = await request(app)
        .post("/api/matriculas")
        .set("X-Role", "admin")
        .set("X-User-Id", "admin1")
        .send({ estudiante: "stu1", materia: "mat1", semestre: "202410" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    /**
     * Prueba que un profesor no puede crear una matrícula.
     */
    it("403 fallo: profesor no puede crear matrícula", async () => {
      createMatriculaController.mockResolvedValue({
        status: 403,
        body: { success: false, error: "No autorizado" },
      });
      const res = await request(app)
        .post("/api/matriculas")
        .set("X-Role", "profesor")
        .set("X-User-Id", "prof1")
        .send({ estudiante: "stu1", materia: "mat1", semestre: "202410" });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/No autorizado/);
    });
  });

  // GET /api/matriculas
  describe("GET /api/matriculas", () => {
    /**
     * Prueba que un estudiante puede listar solo sus matrículas.
     */
    it("200 éxito: estudiante lista sus matrículas", async () => {
      listMatriculasController.mockResolvedValue({
        status: 200,
        body: { success: true, data: [{ id: "m1", estudiante: "stu1" }] },
      });
      const res = await request(app)
        .get("/api/matriculas")
        .set("X-Role", "estudiante")
        .set("X-User-Id", "stu1");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    /**
     * Prueba que un rol desconocido no puede listar matrículas.
     */
    it("403 fallo: rol desconocido", async () => {
      listMatriculasController.mockResolvedValue({
        status: 403,
        body: { success: false, error: "No autorizado" },
      });
      const res = await request(app)
        .get("/api/matriculas")
        .set("X-Role", "guest")
        .set("X-User-Id", "u1");
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/No autorizado/);
    });
  });

  // GET /api/matriculas/:id
  describe("GET /api/matriculas/:id", () => {
    /**
     * Prueba que un administrador puede leer una matrícula por ID.
     */
    it("200 éxito: admin lee matrícula", async () => {
      getMatriculaByIdController.mockResolvedValue({
        status: 200,
        body: { success: true, data: { id: "m1" } },
      });
      const res = await request(app)
        .get("/api/matriculas/m1")
        .set("X-Role", "admin")
        .set("X-User-Id", "admin1");
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("m1");
    });

    /**
     * Prueba que la función retorna un error si la matrícula no existe.
     */
    it("404 fallo: matrícula no existe", async () => {
      getMatriculaByIdController.mockResolvedValue({
        status: 404,
        body: { success: false, error: "No encontrada" },
      });
      const res = await request(app)
        .get("/api/matriculas/noexiste")
        .set("X-Role", "admin")
        .set("X-User-Id", "admin1");
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/No encontrada/);
    });
  });

  // PUT /api/matriculas/:id
  describe("PUT /api/matriculas/:id", () => {
    /**
     * Prueba que un administrador puede actualizar las notas de una matrícula.
     */
    it("200 éxito: admin actualiza notas", async () => {
      updateMatriculaController.mockResolvedValue({
        status: 200,
        body: { success: true, data: { id: "m1", notas: [4, 5] } },
      });
      const res = await request(app)
        .put("/api/matriculas/m1")
        .set("X-Role", "admin")
        .set("X-User-Id", "admin1")
        .send({ notas: [4, 5] });
      expect(res.status).toBe(200);
      expect(res.body.data.notas).toEqual([4, 5]);
    });

    /**
     * Prueba que un estudiante no puede actualizar una matrícula.
     */
    it("403 fallo: estudiante no puede actualizar", async () => {
      updateMatriculaController.mockResolvedValue({
        status: 403,
        body: { success: false, error: "No autorizado" },
      });
      const res = await request(app)
        .put("/api/matriculas/m1")
        .set("X-Role", "estudiante")
        .set("X-User-Id", "stu1")
        .send({ notas: [1, 2] });
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/No autorizado/);
    });
  });

  // DELETE /api/matriculas/:id
  describe("DELETE /api/matriculas/:id", () => {
    /**
     * Prueba que un administrador puede eliminar una matrícula.
     */
    it("200 éxito: admin elimina matrícula", async () => {
      deleteMatriculaController.mockResolvedValue({
        status: 200,
        body: { success: true },
      });
      const res = await request(app)
        .delete("/api/matriculas/m1")
        .set("X-Role", "admin")
        .set("X-User-Id", "admin1");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    /**
     * Prueba que un profesor no puede eliminar una matrícula.
     */
    it("403 fallo: profesor no puede eliminar matrícula", async () => {
      deleteMatriculaController.mockResolvedValue({
        status: 403,
        body: { success: false, error: "No autorizado" },
      });
      const res = await request(app)
        .delete("/api/matriculas/m1")
        .set("X-Role", "profesor")
        .set("X-User-Id", "prof1");
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/No autorizado/);
    });
  });
});
