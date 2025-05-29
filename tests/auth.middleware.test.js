const jwt = require("jsonwebtoken");
const { authenticate } = require("../src/middlewares/auth.middleware");

// Mockea el módulo jsonwebtoken para controlar su comportamiento en las pruebas
jest.mock("jsonwebtoken");

describe("auth.middleware", () => {
  let req, res, next;

  // Configuración inicial antes de cada prueba
  beforeEach(() => {
    req = { headers: {} }; // Simula un objeto de solicitud vacío
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Mockea los métodos de respuesta
    next = jest.fn(); // Mockea la función next
    jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
  });

  it("rechaza si no hay header de autorización", () => {
    // Ejecuta el middleware sin cabecera de autorización
    authenticate(req, res, next);

    // Verifica que se responde con un error 401 y un mensaje adecuado
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token requerido",
    });

    // Verifica que no se llama a la función next
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza si el token es inválido", () => {
    // Simula una cabecera de autorización con un token inválido
    req.headers.authorization = "Bearer invalidtoken";

    // Mockea el comportamiento de jwt.verify para lanzar un error
    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    // Ejecuta el middleware
    authenticate(req, res, next);

    // Verifica que se responde con un error 401 y un mensaje adecuado
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Token inválido",
    });

    // Verifica que no se llama a la función next
    expect(next).not.toHaveBeenCalled();
  });

  it("acepta si el token es válido", () => {
    // Simula una cabecera de autorización con un token válido
    req.headers.authorization = "Bearer validtoken";

    // Mockea el comportamiento de jwt.verify para retornar un payload válido
    jwt.verify.mockReturnValue({ sub: "user1", role: "admin" });

    // Ejecuta el middleware
    authenticate(req, res, next);

    // Verifica que los datos del usuario se agregan al objeto req
    expect(req.user).toEqual({ id: "user1", role: "admin" });

    // Verifica que se llama a la función next
    expect(next).toHaveBeenCalled();
  });
});
