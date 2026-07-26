const banco = require("./banco");

const PH_PADRAO = Number(process.env.PH_PADRAO || 6.2);
let timer = null;

function gerarPh() {
  
  const ruido = Math.random() * 0.3 - 0.15;
  return Number((PH_PADRAO + ruido).toFixed(2));
}

async function emitirUmaLeitura() {
  try {
    await banco.adicionarPh(gerarPh());
  } catch (erro) {
    console.error("Falha ao simular pH:", erro.message || erro);
  }
}

async function iniciarSimuladorPh() {
  if (process.env.DISABLE_PH_SIM === "1") {
    return;
  }
  if (timer) {
    return;
  }

  
  for (let i = 0; i < 5; i++) {
    await emitirUmaLeitura();
  }

  timer = setInterval(() => {
    emitirUmaLeitura();
  }, 4000);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  console.log("Sensor de pH simulado ativo (padrão " + PH_PADRAO + ")");
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
  PH_PADRAO,
};
