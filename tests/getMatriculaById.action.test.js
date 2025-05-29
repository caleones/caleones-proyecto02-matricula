const { getMatriculaById } = require("../src/actions/getMatriculaById.action");

// Mock del modelo Matricula
jest.mock("../src/models/Matricula", () => ({
  findOne: jest.fn(),
}));

const Matricula = require("../src/models/Matricula");

describe("getMatriculaById.action", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Prueba que la función retorna correctamente una matrícula activa encontrada.
   */
  it("éxito: retorna matrícula encontrada", async () => {
    const fakeMatricula = { _id: "mat1", estudiante: "stu1", materia: "mat1" };
    Matricula.findOne.mockResolvedValue(fakeMatricula); // Mock para simular una matrícula activa

    const result = await getMatriculaById("mat1");

    // Verifica que se haya buscado la matrícula con los filtros correctos
    expect(Matricula.findOne).toHaveBeenCalledWith({
      _id: "mat1",
      activo: true,
    });

    // Verifica que el resultado sea la matrícula simulada
    expect(result).toBe(fakeMatricula);
  });

  /**
   * Prueba que la función retorna null si la matrícula no existe o está inactiva.
   */
  it("falla: matrícula no encontrada", async () => {
    Matricula.findOne.mockResolvedValue(null); // Mock para simular que no se encuentra la matrícula

    const result = await getMatriculaById("noexiste");

    // Verifica que se haya buscado la matrícula con los filtros correctos
    expect(Matricula.findOne).toHaveBeenCalledWith({
      _id: "noexiste",
      activo: true,
    });

    // Verifica que el resultado sea null
    expect(result).toBeNull();
  });
});
