const { deleteMatricula } = require("../src/actions/deleteMatricula.action");

// Mock del modelo Matricula
jest.mock("../src/models/Matricula", () => ({
  findById: jest.fn(),
}));

const Matricula = require("../src/models/Matricula");

describe("deleteMatricula.action", () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Prueba que la función desactiva correctamente una matrícula existente.
   */
  it("éxito: desactiva matrícula existente", async () => {
    const fakeMatricula = {
      activo: true, // Estado inicial de la matrícula
      save: jest.fn().mockResolvedValue({ activo: false }), // Mock del método save
    };
    Matricula.findById.mockResolvedValue(fakeMatricula); // Mock de la búsqueda de matrícula

    const result = await deleteMatricula("mat1");

    // Verifica que se haya buscado la matrícula por ID
    expect(Matricula.findById).toHaveBeenCalledWith("mat1");

    // Verifica que el estado de la matrícula se haya cambiado a inactivo
    expect(fakeMatricula.activo).toBe(false);

    // Verifica que el método save haya sido llamado
    expect(fakeMatricula.save).toHaveBeenCalled();

    // Verifica que el resultado sea la matrícula actualizada
    expect(result).toBe(fakeMatricula);
  });

  /**
   * Prueba que la función lanza un error si la matrícula no existe.
   */
  it("falla: matrícula no existe", async () => {
    Matricula.findById.mockResolvedValue(null); // Mock para simular que la matrícula no existe

    // Verifica que se lanza un error con el mensaje adecuado
    await expect(deleteMatricula("noexiste")).rejects.toThrow(/no encontrada/i);

    // Verifica que se haya intentado buscar la matrícula por ID
    expect(Matricula.findById).toHaveBeenCalledWith("noexiste");
  });
});
