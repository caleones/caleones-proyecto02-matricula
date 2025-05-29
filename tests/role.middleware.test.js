const { validateRole } = require("../src/middlewares/role.middleware");

describe("role.middleware", () => {
  let req, res, next;

  // Configuración inicial antes de cada prueba
  beforeEach(() => {
    req = { user: { role: "admin" } }; // Simula un usuario con rol "admin"
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Mockea los métodos de respuesta
    next = jest.fn(); // Mockea la función next
  });

  /**
   * Prueba que el middleware permite acceso si el rol está permitido.
   */
  it("permite acceso si el rol está permitido", () => {
    const middleware = validateRole(["admin", "estudiante"]); // Define roles permitidos
    middleware(req, res, next);

    // Verifica que se llama a la función next y no se responde con error
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * Prueba que el middleware rechaza acceso si el rol NO está permitido.
   */
  it("rechaza acceso si el rol NO está permitido", () => {
    req.user.role = "profesor"; // Cambia el rol del usuario a "profesor"
    const middleware = validateRole(["admin", "estudiante"]); // Define roles permitidos
    middleware(req, res, next);

    // Verifica que se responde con un error 403 y un mensaje adecuado
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "No autorizado",
    });

    // Verifica que no se llama a la función next
    expect(next).not.toHaveBeenCalled();
  });
});
