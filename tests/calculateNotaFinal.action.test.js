const {
  calculateNotaFinal,
} = require("../src/actions/calculateNotaFinal.action");

describe("calculateNotaFinal", () => {
  /**
   * Prueba que la función calcula correctamente la nota final
   * cuando los porcentajes están en formato de 100s (0-100).
   */
  it("calcula correctamente con porcentajes en 100s", () => {
    const notas = [4, 3, 5];
    const porcentajes = [30, 30, 40];
    // 4*0.3 + 3*0.3 + 5*0.4 = 1.2 + 0.9 + 2 = 4.1
    expect(calculateNotaFinal(notas, porcentajes)).toBeCloseTo(4.1);
  });

  /**
   * Prueba que la función calcula correctamente la nota final
   * cuando los porcentajes están en formato decimal (0-1).
   */
  it("calcula correctamente con porcentajes en decimales", () => {
    const notas = [4, 5];
    const porcentajes = [0.5, 0.5];
    // 4*0.5 + 5*0.5 = 2 + 2.5 = 4.5
    expect(calculateNotaFinal(notas, porcentajes)).toBeCloseTo(4.5);
  });

  /**
   * Prueba que la función lanza un error si los parámetros
   * notas o porcentajes no son arreglos.
   */
  it("lanza error si notas y porcentajes no son arrays", () => {
    expect(() => calculateNotaFinal("noarray", [100])).toThrow(/arrays/);
    expect(() => calculateNotaFinal([4], "noarray")).toThrow(/arrays/);
  });

  /**
   * Prueba que la función lanza un error si las longitudes
   * de los arreglos notas y porcentajes no coinciden.
   */
  it("lanza error si longitud de notas y porcentajes no coincide", () => {
    expect(() => calculateNotaFinal([4, 5], [100])).toThrow(/coincidir/);
  });

  /**
   * Prueba que la función calcula correctamente la nota final
   * cuando solo hay un elemento en los arreglos.
   */
  it("funciona con un solo elemento", () => {
    expect(calculateNotaFinal([5], [100])).toBeCloseTo(5);
    expect(calculateNotaFinal([3], [1])).toBeCloseTo(3);
  });

  /**
   * Prueba que la función calcula correctamente la nota final
   * cuando los porcentajes suman menos de 1.
   */
  it("suma correctamente si porcentajes suman menos de 1", () => {
    expect(calculateNotaFinal([4, 5], [0.3, 0.7])).toBeCloseTo(4.7);
  });

  /**
   * Prueba que la función devuelve 0 si todos los valores
   * en los arreglos son 0.
   */
  it("devuelve 0 si todos los valores son 0", () => {
    expect(calculateNotaFinal([0, 0], [50, 50])).toBeCloseTo(0);
  });
});
