const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const PORTA = 3457;
const BASE = "http://127.0.0.1:" + PORTA;
const DATA = path.join(__dirname, "..", "data", "dados.json");

describe("API mistura-tanque", () => {
  let servidor;

  before(async () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    process.env.PORT = String(PORTA);
    process.env.DISABLE_PH_SIM = "1";

    fs.mkdirSync(path.dirname(DATA), { recursive: true });
    fs.writeFileSync(DATA, JSON.stringify({ ph: [], consultas: [] }, null, 2));

    delete require.cache[require.resolve("../lib/banco")];
    delete require.cache[require.resolve("../server")];

    const { iniciar } = require("../server");
    servidor = await iniciar();

    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(BASE + "/api/health");
        if (r.ok) return;
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("Servidor não subiu");
  });

  after(async () => {
    try {
      const { pararSimuladorPh } = require("../server");
      pararSimuladorPh();
    } catch (_) {}
    if (!servidor) return;
    await new Promise((resolve) => servidor.close(() => resolve()));
  });

  it("lista produtos", async () => {
    const r = await fetch(BASE + "/api/produtos");
    const j = await r.json();
    assert.ok(j.produtos.length >= 5);
  });

  it("avalia mistura", async () => {
    const r = await fetch(BASE + "/api/mistura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoA: "biologico",
        produtoB: "fungicida_cobre",
        usarPhAtual: false,
      }),
    });
    const j = await r.json();
    assert.equal(r.status, 200);
    assert.equal(j.nivel, "nao");
  });

  it("recebe pH do IoT", async () => {
    const r = await fetch(BASE + "/api/ph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ph: 6.4 }),
    });
    assert.equal(r.status, 201);
  });
});
