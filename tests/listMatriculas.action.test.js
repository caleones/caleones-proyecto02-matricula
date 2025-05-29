const { listMatriculas } = require("../src/actions/listMatriculas.action");

// Mock del modelo Matricula
jest.mock("../src/models/Matricula", () => ({
  find: jest.fn(),
}));

const Matricula = require("../src/models/Matricula");

describe("listMatriculas.action", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Prueba que la función retorna todas las matrículas activas sin aplicar filtros.
   */
  it("éxito: retorna todas las matrículas activas sin filtros", async () => {
    const fakeList = [
      { _id: "mat1", estudiante: "stu1" },
      { _id: "mat2", estudiante: "stu2" },
    ];
    Matricula.find.mockResolvedValue(fakeList); // Mock para simular la respuesta de la base de datos

    const result = await listMatriculas();

    // Verifica que se haya llamado al método find con el filtro correcto
    expect(Matricula.find).toHaveBeenCalledWith({ activo: true });

    // Verifica que el resultado sea la lista simulada
    expect(result).toBe(fakeList);
  });

  /**
   * Prueba que la función retorna matrículas activas filtradas por estudiante.
   */
  it("éxito: retorna matrículas filtradas por estudiante", async () => {
    const fakeList = [{ _id: "mat1", estudiante: "stu1" }];
    Matricula.find.mockResolvedValue(fakeList); // Mock para simular la respuesta de la base de datos

    const result = await listMatriculas({ estudiante: "stu1" });

    // Verifica que se haya llamado al método find con el filtro correcto
    expect(Matricula.find).toHaveBeenCalledWith({
      activo: true,
      estudiante: "stu1",
    });

    // Verifica que el resultado sea la lista simulada
    expect(result).toBe(fakeList);
  });

  /**
   * Prueba que la función retorna matrículas activas filtradas por materia y semestre.
   */
  it("éxito: retorna matrículas filtradas por materia y semestre", async () => {
    const fakeList = [
      { _id: "mat2", estudiante: "stu2", materia: "mat2", semestre: "202410" },
    ];
    Matricula.find.mockResolvedValue(fakeList); // Mock para simular la respuesta de la base de datos

    const result = await listMatriculas({
      materia: "mat2",
      semestre: "202410",
    });

    // Verifica que se haya llamado al método find con el filtro correcto
    expect(Matricula.find).toHaveBeenCalledWith({
      activo: true,
      materia: "mat2",
      semestre: "202410",
    });

    // Verifica que el resultado sea la lista simulada
    expect(result).toBe(fakeList);
  });

  /**
   * Prueba que la función lanza un error si ocurre un problema inesperado en la consulta.
   */
  it("falla: error inesperado en la consulta", async () => {
    Matricula.find.mockRejectedValue(new Error("fallo DB")); // Mock para simular un error en la base de datos

    // Verifica que se lanza un error con el mensaje adecuado
    await expect(listMatriculas({ estudiante: "stu1" })).rejects.toThrow(
      /fallo DB/
    );
  });
});