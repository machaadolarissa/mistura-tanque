const fs = require("fs");
const path = require("path");

const ARQUIVO = path.join(__dirname, "..", "data", "dados.json");

function usandoTurso() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

function httpUrlTurso() {
  const raw = process.env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, "https://");
  const base = raw.replace(/\/$/, "");
  return base.includes("/v2/pipeline") ? base : base + "/v2/pipeline";
}

function argTurso(valor) {
  if (valor === null || valor === undefined) {
    return { type: "null" };
  }
  if (typeof valor === "number") {
    return Number.isInteger(valor)
      ? { type: "integer", value: String(valor) }
      : { type: "float", value: String(valor) };
  }
  return { type: "text", value: String(valor) };
}

async function tursoExecutar(sql, args = []) {
  const resposta = await fetch(httpUrlTurso(), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.TURSO_AUTH_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql,
            args: args.map(argTurso),
          },
        },
        { type: "close" },
      ],
    }),
  });

  const json = await resposta.json();
  if (!resposta.ok) {
    throw new Error("Turso HTTP " + resposta.status + ": " + JSON.stringify(json));
  }

  const resultado = json.results && json.results[0];
  if (resultado && resultado.type === "error") {
    throw new Error("Turso SQL: " + (resultado.error && resultado.error.message));
  }

  const cols = (resultado.response && resultado.response.result && resultado.response.result.cols) || [];
  const rows = (resultado.response && resultado.response.result && resultado.response.result.rows) || [];

  return rows.map((row) => {
    const obj = {};
    row.forEach((celula, i) => {
      const nome = cols[i].name;
      const v = celula.value;
      obj[nome] = celula.type === "null" ? null : v;
    });
    return obj;
  });
}

function lerJson() {
  if (!fs.existsSync(ARQUIVO)) {
    const vazio = { ph: [], consultas: [] };
    salvarJson(vazio);
    return vazio;
  }
  return JSON.parse(fs.readFileSync(ARQUIVO, "utf8"));
}

function salvarJson(dados) {
  const pasta = path.dirname(ARQUIVO);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2), "utf8");
}

async function init() {
  if (usandoTurso()) {
    await tursoExecutar(`
      CREATE TABLE IF NOT EXISTS ph (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ph REAL NOT NULL,
        criado_em TEXT NOT NULL
      )
    `);
    await tursoExecutar(`
      CREATE TABLE IF NOT EXISTS consultas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nivel TEXT NOT NULL,
        produtos TEXT NOT NULL,
        ph_usado REAL,
        criado_em TEXT NOT NULL
      )
    `);
    console.log("Banco pronto: Turso (nuvem)");
  } else {
    lerJson();
    console.log("Banco pronto: JSON local (data/dados.json)");
  }
}

async function adicionarPh(valor) {
  const criadoEm = new Date().toISOString();
  const ph = Number(valor);

  if (usandoTurso()) {
    await tursoExecutar("INSERT INTO ph (ph, criado_em) VALUES (?, ?)", [ph, criadoEm]);
    return { ph, criadoEm };
  }

  const dados = lerJson();
  const leitura = { ph, criadoEm };
  dados.ph.unshift(leitura);
  dados.ph = dados.ph.slice(0, 100);
  salvarJson(dados);
  return leitura;
}

async function listarPh(limite = 20) {
  if (usandoTurso()) {
    const rows = await tursoExecutar(
      "SELECT ph, criado_em AS criadoEm FROM ph ORDER BY id DESC LIMIT ?",
      [limite]
    );
    return rows.map((r) => ({
      ph: Number(r.ph),
      criadoEm: r.criadoEm,
    }));
  }
  return lerJson().ph.slice(0, limite);
}

async function salvarConsulta(resumo) {
  const criadoEm = new Date().toISOString();
  const produtos = resumo.produtos || [];
  const phUsado =
    resumo.phUsado === null || resumo.phUsado === undefined
      ? null
      : Number(resumo.phUsado);

  if (usandoTurso()) {
    await tursoExecutar(
      "INSERT INTO consultas (nivel, produtos, ph_usado, criado_em) VALUES (?, ?, ?, ?)",
      [resumo.nivel, JSON.stringify(produtos), phUsado, criadoEm]
    );
    return { id: Date.now(), criadoEm, nivel: resumo.nivel, produtos, phUsado };
  }

  const dados = lerJson();
  const item = {
    id: Date.now(),
    criadoEm,
    nivel: resumo.nivel,
    produtos,
    phUsado,
  };
  dados.consultas.unshift(item);
  dados.consultas = dados.consultas.slice(0, 50);
  salvarJson(dados);
  return item;
}

async function listarConsultas(limite = 10) {
  if (usandoTurso()) {
    const rows = await tursoExecutar(
      `SELECT id, nivel, produtos, ph_usado AS phUsado, criado_em AS criadoEm
       FROM consultas ORDER BY id DESC LIMIT ?`,
      [limite]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      nivel: r.nivel,
      produtos: JSON.parse(r.produtos),
      phUsado: r.phUsado === null || r.phUsado === undefined ? null : Number(r.phUsado),
      criadoEm: r.criadoEm,
    }));
  }
  return lerJson().consultas.slice(0, limite);
}

async function limparTudo() {
  if (usandoTurso()) {
    await tursoExecutar("DELETE FROM ph");
    await tursoExecutar("DELETE FROM consultas");
    return;
  }
  salvarJson({ ph: [], consultas: [] });
}

module.exports = {
  init,
  adicionarPh,
  listarPh,
  salvarConsulta,
  listarConsultas,
  limparTudo,
  usandoTurso,
};
