const URL_API = process.env.API_URL || "http://localhost:3000/api/ph";
const PH_PADRAO = Number(process.env.PH_PADRAO || 6.2);

function gerarPh() {
  const ruido = Math.random() * 0.3 - 0.15;
  return Number((PH_PADRAO + ruido).toFixed(2));
}

async function enviar() {
  const ph = gerarPh();
  try {
    const r = await fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ph }),
    });
    if (!r.ok) {
      console.error("Falha:", r.status, await r.text());
      return;
    }
    console.log(new Date().toLocaleTimeString("pt-BR"), "→ pH", ph);
  } catch (e) {
    console.error("Servidor offline?", e.message);
  }
}

console.log("(Opcional) Simulador externo →", URL_API);
enviar();
setInterval(enviar, 4000);
