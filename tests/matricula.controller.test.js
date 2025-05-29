const {
  createMatriculaController,
  getMatriculaByIdController,
  listMatriculasController,
  updateMatriculaController,
  deleteMatriculaController,
} = require("../src/controllers/matricula.controller");

// Mock de acciones y servicios
jest.mock("../src/actions/createMatricula.action", () => ({
  createMatricula: jest.fn(),
}));
jest.mock("../src/actions/getMatriculaById.action", () => ({
  getMatriculaById: jest.fn(),
}));
jest.mock("../src/actions/listMatriculas.action", () => ({
  listMatriculas: jest.fn(),
}));
jest.mock("../src/actions/updateMatricula.action", () => ({
  updateMatricula: jest.fn(),
}));
jest.mock("../src/actions/deleteMatricula.action", () => ({
  deleteMatricula: jest.fn(),
}));
jest.mock("../src/services/materia.service", () => ({
  getMateriasPorProfesor: jest.fn(),
}));

const { createMatricula } = require("../src/actions/createMatricula.action");
const { getMatriculaById } = require("../src/actions/getMatriculaById.action");
const { listMatriculas } = require("../src/actions/listMatriculas.action");
const { updateMatricula } = require("../src/actions/updateMatricula.action");
const { deleteMatricula } = require("../src/actions/deleteMatricula.action");
const { getMateriasPorProfesor } = require("../src/services/materia.service");

describe("createMatriculaController", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  /**
   * Prueba que un administrador puede crear una matrícula.
   */
  it("éxito: admin crea matrícula", async () => {
    createMatricula.mockResolvedValue({ id: "m1" });
    const res = await createMatriculaController({
      user: { id: "admin1", role: "admin" },
      body: { estudiante: "stu1", materia: "mat1", semestre: "202410" },
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(createMatricula).toHaveBeenCalled();
  });

  /**
   * Prueba que un estudiante no puede crear una matrícula para otro estudiante.
   */
  it("falla: estudiante intenta crear matrícula para otro", async () => {
    const res = await createMatriculaController({
      user: { id: "stu1", role: "estudiante" },
      body: { estudiante: "stu2", materia: "mat1", semestre: "202410" },
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/No autorizado/);
    expect(createMatricula).not.toHaveBeenCalled();
  });
});

describe("getMatriculaByIdController", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  /**
   * Prueba que un administrador puede leer cualquier matrícula.
   */
  it("éxito: admin puede leer cualquier matrícula", async () => {
    getMatriculaById.mockResolvedValue({
      _id: "m1",
      estudiante: "stu1",
      materia: "mat1",
    });
    const res = await getMatriculaByIdController({
      user: { id: "admin1", role: "admin" },
      params: { id: "m1" },
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  /**
   * Prueba que la función retorna un error si la matrícula no existe.
   */
  it("falla: matrícula no existe", async () => {
    getMatriculaById.mockResolvedValue(null);
    const res = await getMatriculaByIdController({
      user: { id: "admin1", role: "admin" },
      params: { id: "noexiste" },
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No encontrada/);
  });
});

describe("listMatriculasController", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  /**
   * Prueba que un estudiante puede listar solo sus matrículas.
   */
  it("éxito: estudiante lista solo sus matrículas", async () => {
    listMatriculas.mockResolvedValue([{ id: "m1", estudiante: "stu1" }]);
    const res = await listMatriculasController({
      user: { id: "stu1", role: "estudiante" },
      query: {},
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(listMatriculas).toHaveBeenCalledWith(
      expect.objectContaining({ estudiante: "stu1" })
    );
  });

  /**
   * Prueba que la función retorna un error interno si ocurre un problema.
   */
  it("falla: error interno", async () => {
    listMatriculas.mockRejectedValue(new Error("fallo interno"));
    const res = await listMatriculasController({
      user: { id: "admin1", role: "admin" },
      query: {},
    });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/fallo interno/);
  });
});

describe("updateMatriculaController", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  /**
   * Prueba que un administrador puede actualizar las notas de una matrícula.
   */
  it("éxito: admin actualiza notas", async () => {
    updateMatricula.mockResolvedValue({ id: "m1", notas: [4, 5] });
    const res = await updateMatriculaController({
      user: { id: "admin1", role: "admin" },
      params: { id: "m1" },
      body: { notas: [4, 5] },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.notas).toEqual([4, 5]);
  });

  /**
   * Prueba que un estudiante no puede actualizar una matrícula.
   */
  it("falla: estudiante no puede actualizar", async () => {
    const res = await updateMatriculaController({
      user: { id: "stu1", role: "estudiante" },
      params: { id: "m1" },
      body: { notas: [1, 2] },
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/No autorizado/);
  });
});

describe("deleteMatriculaController", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => jest.clearAllMocks());

  /**
   * Prueba que un administrador puede eliminar una matrícula.
   */
  it("éxito: admin elimina matrícula", async () => {
    deleteMatricula.mockResolvedValue();
    const res = await deleteMatriculaController({
      user: { id: "admin1", role: "admin" },
      params: { id: "m1" },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(deleteMatricula).toHaveBeenCalledWith("m1");
  });

  /**
   * Prueba que un estudiante no puede eliminar una matrícula ajena.
   */
  it("falla: estudiante intenta borrar matrícula ajena", async () => {
    getMatriculaById.mockResolvedValue({ estudiante: "otro" });
    const res = await deleteMatriculaController({
      user: { id: "stu1", role: "estudiante" },
      params: { id: "m1" },
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/No autorizado/);
    expect(deleteMatricula).not.toHaveBeenCalled();
  });
});
