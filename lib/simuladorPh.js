const banco = require("./banco");

const PH_PADRAO = Number(process.env.PH_PADRAO || 6.2);
const DIAS_HISTORICO = Number(process.env.PH_DIAS_HISTORICO || 7);
let timer = null;

function gerarPh() {
  const ruido = Math.random() * 0.3 - 0.15;
  return Number((PH_PADRAO + ruido).toFixed(2));
}

async function emitirUmaLeitura(criadoEm) {
  try {
    await banco.adicionarPh(gerarPh(), criadoEm);
  } catch (erro) {
    console.error("Falha ao simular pH:", erro.message || erro);
  }
}

/** Garante pelo menos uma leitura simulada por dia nos últimos N dias. */
async function semearHistoricoDiario() {
  const existentes = await banco.listarPh(200);
  const diasComLeitura = new Set(
    existentes.map((l) => new Date(l.criadoEm).toISOString().slice(0, 10))
  );

  const agora = new Date();
  const horas = [8, 12, 16, 20];

  for (let d = DIAS_HISTORICO - 1; d >= 0; d--) {
    const dia = new Date(agora);
    dia.setHours(12, 0, 0, 0);
    dia.setDate(dia.getDate() - d);
    const chave = dia.toISOString().slice(0, 10);

    if (diasComLeitura.has(chave)) continue;

    for (const hora of horas) {
      const criadoEm = new Date(dia);
      criadoEm.setHours(hora, Math.floor(Math.random() * 50), Math.floor(Math.random() * 50), 0);
      if (criadoEm > agora) continue;
      await emitirUmaLeitura(criadoEm.toISOString());
    }
  }
}

async function iniciarSimuladorPh() {
  if (process.env.DISABLE_PH_SIM === "1") {
    return;
  }
  if (timer) {
    return;
  }

  await semearHistoricoDiario();

  for (let i = 0; i < 3; i++) {
    await emitirUmaLeitura();
  }

  timer = setInterval(() => {
    emitirUmaLeitura();
  }, 4000);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  console.log(
    "Sensor de pH simulado ativo (padrão " +
      PH_PADRAO +
      ", histórico de " +
      DIAS_HISTORICO +
      " dias)"
  );
}

function pararSimuladorPh() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  iniciarSimuladorPh,
  pararSimuladorPh,
  gerarPh,
  semearHistoricoDiario,
  PH_PADRAO,
};
