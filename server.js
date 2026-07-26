const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const linha of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const chave = t.slice(0, i).trim();
    let valor = t.slice(i + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}

const express = require("express");
const { listarProdutos } = require("./lib/produtos");
const { avaliarMistura } = require("./lib/compatibilidade");
const { mediaMovel, phForaDaFaixaIdeal } = require("./lib/dsp");
const banco = require("./lib/banco");
const { iniciarSimuladorPh, pararSimuladorPh } = require("./lib/simuladorPh");

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/agua", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "agua.html"));
});

app.get("/historico", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "historico.html"));
});

app.get("/api/produtos", (_req, res) => {
  res.json({ produtos: listarProdutos() });
});

app.post("/api/mistura", async (req, res) => {
  try {
    const { produtoA, produtoB, produtoC, usarPhAtual } = req.body;
    const ids = [produtoA, produtoB, produtoC].filter(Boolean);

    let phMedio = null;
    if (usarPhAtual !== false) {
      const leituras = await banco.listarPh(10);
      phMedio = mediaMovel(leituras.map((l) => l.ph));
    }

    const resultado = avaliarMistura(ids, phMedio);
    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    await banco.salvarConsulta({
      nivel: resultado.nivel,
      produtos: resultado.produtos.map((p) => p.nome),
      phUsado: resultado.phUsado,
    });

    res.json(resultado);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao avaliar mistura." });
  }
});

app.post("/api/ph", async (req, res) => {
  try {
    const { ph } = req.body;
    if (ph === undefined || Number.isNaN(Number(ph))) {
      return res.status(400).json({ erro: "Envie { ph: numero }" });
    }
    const leitura = await banco.adicionarPh(ph);
    res.status(201).json({ ok: true, leitura });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao salvar pH." });
  }
});

app.get("/api/ph", async (_req, res) => {
  try {
    const leituras = await banco.listarPh(20);
    const media = mediaMovel(leituras.map((l) => l.ph));
    res.json({
      ultima: leituras[0] || null,
      media: media === null ? null : Number(media.toFixed(2)),
      alerta: phForaDaFaixaIdeal(media, 5, 7),
      faixaIdeal: { min: 5, max: 7 },
      leituras,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao ler pH." });
  }
});

app.get("/api/historico", async (_req, res) => {
  try {
    res.json({ consultas: await banco.listarConsultas(15) });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao ler histórico." });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    await banco.init();
    res.json({
      ok: true,
      projeto: "mistura-tanque-agro",
      banco: banco.usandoTurso() ? "turso" : "json-local",
    });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: String(erro.message || erro) });
  }
});

async function iniciar() {
  await banco.init();
  await iniciarSimuladorPh();

  return app.listen(PORTA, "0.0.0.0", () => {
    console.log("");
    console.log("========================================");
    console.log("  Mistura no Tanque — no ar!");
    console.log("  http://localhost:" + PORTA);
    console.log("========================================");
    console.log("  /           → verificar mistura");
    console.log("  /agua       → pH da água (IoT)");
    console.log("  /historico  → consultas recentes");
    console.log("");
  });
}

if (require.main === module) {
  iniciar().catch((erro) => {
    console.error("Não subiu o servidor:", erro);
    process.exit(1);
  });
}

module.exports = { app, iniciar, pararSimuladorPh };
