const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { avaliarMistura, regraDoPar } = require("../lib/compatibilidade");
const { mediaMovel, phForaDaFaixaIdeal } = require("../lib/dsp");

describe("compatibilidade", () => {
  it("bloqueia biológico + cobre", () => {
    const r = avaliarMistura(["biologico", "fungicida_cobre"], 6.5);
    assert.equal(r.ok, true);
    assert.equal(r.nivel, "nao");
  });

  it("glifosato + 2,4-D fica em cuidado", () => {
    const r = avaliarMistura(["herbicida_glifosato", "herbicida_24d"], 6);
    assert.equal(r.nivel, "cuidado");
  });

  it("exige pelo menos 2 produtos", () => {
    const r = avaliarMistura(["herbicida_glifosato"]);
    assert.equal(r.ok, false);
  });

  it("regra do par cobre + oleo é cuidado", () => {
    const r = regraDoPar("fungicida_cobre", "oleo_mineral");
    assert.equal(r.nivel, "cuidado");
  });
});

describe("dsp", () => {
  it("média móvel funciona", () => {
    assert.equal(mediaMovel([6, 7, 8]), 7);
  });

  it("detecta pH alto", () => {
    assert.equal(phForaDaFaixaIdeal(8.2, 5, 7), true);
  });
});
