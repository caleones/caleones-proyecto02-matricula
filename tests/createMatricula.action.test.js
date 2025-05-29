const { createMatricula } = require("../src/actions/createMatricula.action");

// Mock de dependencias externas
jest.mock("../src/models/Matricula", () => {
  return function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, _id: "mat1" }),
    };
  };
});
jest.mock("../src/services/materia.service", () => ({
  getPorcentajeEvaluaciones: jest.fn(),
}));
jest.mock("../src/actions/calculateNotaFinal.action", () => ({
  calculateNotaFinal: jest.fn(),
}));

const {
  getPorcentajeEvaluaciones,
} = require("../src/services/materia.service");
const {
  calculateNotaFinal,
} = require("../src/actions/calculateNotaFinal.action");

describe("createMatricula.action", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Prueba que la función crea correctamente una matrícula
   * cuando se proporcionan notas válidas.
   */
  it("éxito: crea matrícula con notas válidas", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([30, 30, 40]);
    calculateNotaFinal.mockReturnValue(4.2);

    const result = await createMatricula({
      estudiante: "stu1",
      materia: "mat1",
      semestre: "202410",
      notas: [4, 4, 5],
    });

    // Verifica que las dependencias externas se llamen correctamente
    expect(getPorcentajeEvaluaciones).toHaveBeenCalledWith("mat1");
    expect(calculateNotaFinal).toHaveBeenCalledWith([4, 4, 5], [30, 30, 40]);

    // Verifica que el resultado sea el esperado
    expect(result).toMatchObject({
      estudiante: "stu1",
      materia: "mat1",
      semestre: "202410",
      notas: [4, 4, 5],
      notaFinal: 4.2,
      activo: true,
      _id: "mat1",
    });
  });

  /**
   * Prueba que la función crea correctamente una matrícula
   * cuando no se proporcionan notas (se inicializan en cero).
   */
  it("éxito: crea matrícula sin notas (se inicializan en cero)", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([50, 50]);
    calculateNotaFinal.mockReturnValue(0);

    const result = await createMatricula({
      estudiante: "stu1",
      materia: "mat1",
      semestre: "202410",
    });

    // Verifica que las notas se inicialicen en cero
    expect(result.notas).toEqual([0, 0]);
    expect(result.notaFinal).toBe(0);
  });

  /**
   * Prueba que la función lanza un error si faltan campos requeridos.
   */
  it("falla: faltan campos requeridos", async () => {
    await expect(
      createMatricula({ estudiante: "stu1", materia: "mat1" })
    ).rejects.toThrow(/requeridos/);
  });

  /**
   * Prueba que la función lanza un error si falla el servicio externo
   * al obtener los porcentajes de evaluación.
   */
  it("falla: error al obtener porcentajes", async () => {
    getPorcentajeEvaluaciones.mockRejectedValue(new Error("Servicio caído"));
    await expect(
      createMatricula({
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
      })
    ).rejects.toThrow(/No se pudo obtener porcentajes/);
  });

  /**
   * Prueba que la función lanza un error si los porcentajes son inválidos.
   */
  it("falla: porcentajes inválidos", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([]);
    await expect(
      createMatricula({
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
      })
    ).rejects.toThrow(/Porcentajes de evaluaciones inválidos/);
  });

  /**
   * Prueba que la función lanza un error si las notas no son un arreglo.
   */
  it("falla: notas no es array", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([100]);
    await expect(
      createMatricula({
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
        notas: "noarray",
      })
    ).rejects.toThrow(/notas debe ser un array/);
  });

  /**
   * Prueba que la función lanza un error si la cantidad de notas
   * y porcentajes no coincide.
   */
  it("falla: cantidad de notas y porcentajes no coincide", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([50, 50]);
    await expect(
      createMatricula({
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
        notas: [4],
      })
    ).rejects.toThrow(/número de notas y de porcentajes debe coincidir/);
  });

  /**
   * Prueba que la función lanza un error si alguna nota está fuera de rango.
   */
  it("falla: nota fuera de rango", async () => {
    getPorcentajeEvaluaciones.mockResolvedValue([100]);
    await expect(
      createMatricula({
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
        notas: [7],
      })
    ).rejects.toThrow(/Cada nota debe ser un número entre 0 y 5/);
  });
});
