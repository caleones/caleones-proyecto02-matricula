const { updateMatricula } = require("../src/actions/updateMatricula.action");

// Mock del modelo Matricula
jest.mock("../src/models/Matricula", () => ({
  findOne: jest.fn(),
}));
jest.mock("../src/services/materia.service", () => ({
  getPorcentajeEvaluaciones: jest.fn(),
}));
jest.mock("../src/actions/calculateNotaFinal.action", () => ({
  calculateNotaFinal: jest.fn(),
}));

const Matricula = require("../src/models/Matricula");
const {
  getPorcentajeEvaluaciones,
} = require("../src/services/materia.service");
const {
  calculateNotaFinal,
} = require("../src/actions/calculateNotaFinal.action");

describe("updateMatricula.action", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Prueba que la función actualiza correctamente las notas y la nota final.
   */
  it("éxito: actualiza notas y notaFinal", async () => {
    const fakeMatricula = {
      _id: "mat1",
      materia: "mat1",
      notas: [3, 4],
      save: jest
        .fn()
        .mockResolvedValue({ _id: "mat1", notas: [4, 5], notaFinal: 4.5 }),
    };
    Matricula.findOne.mockResolvedValue(fakeMatricula);
    getPorcentajeEvaluaciones.mockResolvedValue([50, 50]);
    calculateNotaFinal.mockReturnValue(4.5);

    const result = await updateMatricula("mat1", { notas: [4, 5] });

    // Verifica que se haya buscado la matrícula activa por ID
    expect(Matricula.findOne).toHaveBeenCalledWith({
      _id: "mat1",
      activo: true,
    });

    // Verifica que se hayan obtenido los porcentajes de evaluación
    expect(getPorcentajeEvaluaciones).toHaveBeenCalledWith("mat1");

    // Verifica que se haya calculado la nota final correctamente
    expect(calculateNotaFinal).toHaveBeenCalledWith([4, 5], [50, 50]);

    // Verifica que las notas se hayan actualizado
    expect(fakeMatricula.notas).toEqual([4, 5]);

    // Verifica que el resultado sea la matrícula actualizada
    expect(result).toMatchObject({
      _id: "mat1",
      notas: [4, 5],
      notaFinal: 4.5,
    });
  });

  /**
   * Prueba que la función lanza un error si la matrícula no existe o está inactiva.
   */
  it("falla: matrícula no encontrada o inactiva", async () => {
    Matricula.findOne.mockResolvedValue(null);
    await expect(
      updateMatricula("noexiste", { notas: [4, 5] })
    ).rejects.toThrow(/no encontrada/i);
  });

  /**
   * Prueba que la función lanza un error si no se envían notas.
   */
  it("falla: notas no enviadas", async () => {
    Matricula.findOne.mockResolvedValue({ _id: "mat1", materia: "mat1" });
    await expect(updateMatricula("mat1", {})).rejects.toThrow(/array de notas/);
  });

  /**
   * Prueba que la función lanza un error si las notas no son un arreglo.
   */
  it("falla: notas no es array", async () => {
    Matricula.findOne.mockResolvedValue({ _id: "mat1", materia: "mat1" });
    await expect(updateMatricula("mat1", { notas: "noarray" })).rejects.toThrow(
      /array de notas/
    );
  });

  /**
   * Prueba que la función lanza un error si alguna nota está fuera de rango.
   */
  it("falla: nota fuera de rango", async () => {
    Matricula.findOne.mockResolvedValue({ _id: "mat1", materia: "mat1" });
    await expect(updateMatricula("mat1", { notas: [6] })).rejects.toThrow(
      /número entre 0 y 5/
    );
  });

  /**
   * Prueba que la función lanza un error si falla el servicio externo al obtener porcentajes.
   */
  it("falla: error al obtener porcentajes", async () => {
    Matricula.findOne.mockResolvedValue({
      _id: "mat1",
      materia: "mat1",
      notas: [4, 5],
    });
    getPorcentajeEvaluaciones.mockRejectedValue(new Error("servicio caído"));
    await expect(updateMatricula("mat1", { notas: [4, 5] })).rejects.toThrow(
      /No se pudo obtener porcentajes/
    );
  });
});
