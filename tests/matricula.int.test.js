const request = require("supertest");
const app = require("../src/server");

// Mock de JWT para autenticar siempre como usuario válido
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token, secret) => {
    if (token === "admin") return { sub: "admin1", role: "admin" };
    if (token === "estudiante") return { sub: "stu1", role: "estudiante" };
    if (token === "profesor") return { sub: "prof1", role: "profesor" };
    throw new Error("Token inválido");
  }),
}));

// Mock de servicios externos de materia
jest.mock("../src/services/materia.service", () => ({
  getPorcentajeEvaluaciones: jest.fn(async (materiaId) => {
    if (materiaId === "mat1") return [30, 30, 40];
    if (materiaId === "mat2") return [50, 50];
    throw new Error("Materia no encontrada");
  }),
  getMateriasPorProfesor: jest.fn(async (profesorId) => {
    if (profesorId === "prof1") return [{ _id: "mat1" }, { _id: "mat2" }];
    return [];
  }),
}));

// Mock de modelos de Mongoose
jest.mock("../src/models/Matricula", () => {
  // Simula una pequeña "base de datos" en memoria
  let db = [
    {
      _id: "mat1",
      estudiante: "stu1",
      materia: "mat1",
      semestre: "202410",
      notas: [4, 4, 5],
      notaFinal: 4.1,
      activo: true,
    },
  ];

  function Matricula(data) {
    Object.assign(this, data);
    this._id = this._id || "mat" + (db.length + 1);
    this.activo = this.activo !== undefined ? this.activo : true;
  }

  Matricula.find = jest.fn(async (filter) => {
    let result = db.filter((m) => m.activo);
    if (filter.estudiante)
      result = result.filter((m) => m.estudiante === filter.estudiante);
    if (filter.materia)
      result = result.filter(
        (m) =>
          m.materia === filter.materia ||
          (filter.materia.$in && filter.materia.$in.includes(m.materia))
      );
    if (filter.semestre)
      result = result.filter((m) => m.semestre === filter.semestre);
    return result;
  });

  Matricula.findOne = jest.fn(async (filter) => {
    const found = db.find(
      (m) => m._id === filter._id && m.activo === filter.activo
    );
    if (!found) return undefined;
    return new Matricula({ ...found });
  });

  Matricula.findById = jest.fn(async (id) => {
    const found = db.find((m) => m._id === id && m.activo);
    if (!found) return undefined;
    return new Matricula({ ...found });
  });

  Matricula.prototype.save = async function () {
    const idx = db.findIndex((m) => m._id === this._id);
    if (idx >= 0) {
      db[idx] = { ...db[idx], ...this };
      return db[idx];
    } else {
      db.push(this);
      return this;
    }
  };

  Matricula.prototype.toObject = function () {
    return { ...this };
  };

  Matricula.resetDb = () => {
    db = [
      {
        _id: "mat1",
        estudiante: "stu1",
        materia: "mat1",
        semestre: "202410",
        notas: [4, 4, 5],
        notaFinal: 4.1,
        activo: true,
      },
    ];
  };

  return Matricula;
});

// Mock de calculateNotaFinal
jest.mock("../src/actions/calculateNotaFinal.action", () => ({
  calculateNotaFinal: jest.fn((notas, porcentajes) => {
    // Suma ponderada simple para test
    const sumaPesos = porcentajes.reduce((sum, p) => sum + p, 0);
    const pesos = sumaPesos > 1 ? porcentajes.map((p) => p / 100) : porcentajes;
    return notas.reduce((acc, n, i) => acc + n * pesos[i], 0);
  }),
}));

const Matricula = require("../src/models/Matricula");

describe("Integración E2E /api/matriculas", () => {
  // Limpia la base de datos simulada y los mocks antes de cada prueba
  beforeEach(() => {
    Matricula.resetDb();
    jest.clearAllMocks();
  });

  /**
   * Prueba que un administrador puede crear una matrícula.
   */
  it("POST /api/matriculas (admin) - éxito", async () => {
    const res = await request(app)
      .post("/api/matriculas")
      .set("Authorization", "Bearer admin")
      .send({
        estudiante: "stu2",
        materia: "mat2",
        semestre: "202420",
        notas: [5, 4],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estudiante).toBe("stu2");
    expect(res.body.data.materia).toBe("mat2");
    expect(res.body.data.notaFinal).toBeCloseTo(4.5);
  });

  /**
   * Prueba que un estudiante puede crear su propia matrícula.
   */
  it("POST /api/matriculas (estudiante) - éxito", async () => {
    const res = await request(app)
      .post("/api/matriculas")
      .set("Authorization", "Bearer estudiante")
      .send({
        materia: "mat2",
        semestre: "202420",
        notas: [3, 2],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estudiante).toBe("stu1");
    expect(res.body.data.notaFinal).toBeCloseTo(2.5);
  });

  /**
   * Prueba que un administrador puede listar todas las matrículas activas.
   */
  it("GET /api/matriculas - lista matrículas (admin)", async () => {
    const res = await request(app)
      .get("/api/matriculas")
      .set("Authorization", "Bearer admin");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  /**
   * Prueba que un administrador puede obtener una matrícula por ID.
   */
  it("GET /api/matriculas/:id - éxito", async () => {
    const res = await request(app)
      .get("/api/matriculas/mat1")
      .set("Authorization", "Bearer admin");
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe("mat1");
  });

  /**
   * Prueba que un administrador puede actualizar las notas de una matrícula.
   */
  it("PUT /api/matriculas/:id - actualiza notas (admin)", async () => {
    const res = await request(app)
      .put("/api/matriculas/mat1")
      .set("Authorization", "Bearer admin")
      .send({ notas: [5, 5, 5] });
    expect(res.status).toBe(200);
    expect(res.body.data.notas).toEqual([5, 5, 5]);
    expect(res.body.data.notaFinal).toBeCloseTo(5);
  });

  /**
   * Prueba que un administrador puede eliminar una matrícula.
   */
  it("DELETE /api/matriculas/:id - elimina matrícula (admin)", async () => {
    const res = await request(app)
      .delete("/api/matriculas/mat1")
      .set("Authorization", "Bearer admin");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verifica que ya no está activa
    const getRes = await request(app)
      .get("/api/matriculas/mat1")
      .set("Authorization", "Bearer admin");
    expect(getRes.status).toBe(404);
  });

  /**
   * Prueba que la función lanza un error si las notas están fuera de rango.
   */
  it("POST /api/matriculas - error por notas fuera de rango", async () => {
    const res = await request(app)
      .post("/api/matriculas")
      .set("Authorization", "Bearer admin")
      .send({
        estudiante: "stu2",
        materia: "mat2",
        semestre: "202420",
        notas: [10, 4],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/número entre 0 y 5/);
  });

  /**
   * Prueba que la función lanza un error si la matrícula no existe.
   */
  it("GET /api/matriculas/:id - error matrícula no existe", async () => {
    const res = await request(app)
      .get("/api/matriculas/noexiste")
      .set("Authorization", "Bearer admin");
    expect(res.status).toBe(404);
  });

  /**
   * Prueba que la función lanza un error si intenta actualizar una matrícula inexistente.
   */
  it("PUT /api/matriculas/:id - error matrícula no existe", async () => {
    const res = await request(app)
      .put("/api/matriculas/noexiste")
      .set("Authorization", "Bearer admin")
      .send({ notas: [4, 5] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no encontrada/i);
  });

  /**
   * Prueba que la función lanza un error si intenta eliminar una matrícula inexistente.
   */
  it("DELETE /api/matriculas/:id - error matrícula no existe", async () => {
    const res = await request(app)
      .delete("/api/matriculas/noexiste")
      .set("Authorization", "Bearer admin");
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/no encontrada/i);
  });
});
