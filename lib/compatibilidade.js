const { buscarProduto } = require("./produtos");

const REGRAS = {
  "biologico|fungicida_cobre": {
    nivel: "nao",
    motivo: "Cobre pode matar o micro-organismo do biológico.",
  },
  "biologico|calda_sulfocalcica": {
    nivel: "nao",
    motivo: "Calda sulfocálcica é agressiva a produtos biológicos.",
  },
  "calda_sulfocalcica|fungicida_cobre": {
    nivel: "nao",
    motivo: "Risco alto de reação química indesejada entre cúpricos e sulfocálcica.",
  },
  "calda_sulfocalcica|oleo_mineral": {
    nivel: "nao",
    motivo: "Óleo + sulfocálcica pode causar fitotoxicidade severa.",
  },
  "fungicida_cobre|oleo_mineral": {
    nivel: "cuidado",
    motivo: "Pode aumentar risco de queima foliar. Faça teste de jarra e veja a bula.",
  },
  "fertilizante_foliar|herbicida_glifosato": {
    nivel: "cuidado",
    motivo: "Sais do fertilizante podem reduzir a eficiência do glifosato.",
  },
  "herbicida_24d|herbicida_glifosato": {
    nivel: "cuidado",
    motivo: "Mistura comum, mas respeite a ordem de adição e a qualidade da água.",
  },
  "espalhante|herbicida_glifosato": {
    nivel: "ok",
    motivo: "Adjuvante costuma ser compatível; confirme dose na bula.",
  },
  "espalhante|inseticida_piretroide": {
    nivel: "ok",
    motivo: "Em geral compatível; evite excesso de espalhante.",
  },
  "herbicida_glifosato|oleo_mineral": {
    nivel: "cuidado",
    motivo: "Pode alterar a absorção. Confirme indicação na bula.",
  },
  "biologico|oleo_mineral": {
    nivel: "cuidado",
    motivo: "Alguns óleos prejudicam biológicos. Verifique o produto específico.",
  },
  "biologico|herbicida_glifosato": {
    nivel: "cuidado",
    motivo: "Aplicar em horários/condições diferentes costuma ser mais seguro.",
  },
  "fertilizante_foliar|fungicida_cobre": {
    nivel: "cuidado",
    motivo: "Pode haver precipitação. Faça teste de jarra.",
  },
  "calda_sulfocalcica|herbicida_glifosato": {
    nivel: "nao",
    motivo: "Não misture sulfocálcica com herbicidas sem orientação técnica.",
  },
  "herbicida_24d|oleo_mineral": {
    nivel: "cuidado",
    motivo: "Risco de deriva/fitotoxicidade aumenta. Cuidado com dose e clima.",
  },
};

const PESO = { ok: 0, cuidado: 1, nao: 2 };

function chavePar(idA, idB) {
  return [idA, idB].sort().join("|");
}

function regraDoPar(idA, idB) {
  if (idA === idB) {
    return {
      nivel: "ok",
      motivo: "É o mesmo produto (só volume/dose).",
    };
  }

  const regra = REGRAS[chavePar(idA, idB)];
  if (reguaOk(regra)) {
    return regra;
  }

  
  return {
    nivel: "cuidado",
    motivo:
      "Não há regra específica cadastrada para este par. Consulte a bula e faça teste de jarra.",
  };
}

function reguaOk(regra) {
  return regra && regra.nivel && regra.motivo;
}

function avaliarMistura(ids, phMedio = null) {
  const unicos = [...new Set(ids.filter(Boolean))];

  if (unicos.length < 2) {
    return {
      ok: false,
      erro: "Escolha pelo menos 2 produtos diferentes.",
    };
  }

  if (unicos.length > 3) {
    return {
      ok: false,
      erro: "Nesta versão simples, no máximo 3 produtos.",
    };
  }

  const produtos = unicos.map((id) => {
    const p = buscarProduto(id);
    return p ? { id: p.id, nome: p.nome, tipo: p.tipo, phIdeal: p.phIdeal } : null;
  });

  if (produtos.some((p) => !p)) {
    return { ok: false, erro: "Produto inválido na lista." };
  }

  const pares = [];
  for (let i = 0; i < produtos.length; i++) {
    for (let j = i + 1; j < produtos.length; j++) {
      const regra = regraDoPar(produtos[i].id, produtos[j].id);
      pares.push({
        a: produtos[i].nome,
        b: produtos[j].nome,
        nivel: regra.nivel,
        motivo: regra.motivo,
      });
    }
  }

  let nivelFinal = "ok";
  for (const par of pares) {
    if (PESO[par.nivel] > PESO[nivelFinal]) {
      nivelFinal = par.nivel;
    }
  }

  const avisosPh = [];
  if (phMedio !== null && phMedio !== undefined && !Number.isNaN(Number(phMedio))) {
    const ph = Number(phMedio);
    for (const p of produtos) {
      if (ph < p.phIdeal.min || ph > p.phIdeal.max) {
        avisosPh.push(
          `${p.nome}: pH da água (${ph.toFixed(2)}) fora da faixa sugerida (${p.phIdeal.min}–${p.phIdeal.max}).`
        );
        if (nivelFinal === "ok") {
          nivelFinal = "cuidado";
        }
      }
    }
  }

  const titulos = {
    ok: "Pode misturar (com base nas regras da demo)",
    cuidado: "Mistura possível, mas com cuidado",
    nao: "Não misture",
  };

  return {
    ok: true,
    nivel: nivelFinal,
    titulo: titulos[nivelFinal],
    produtos,
    pares,
    avisosPh,
    phUsado: phMedio === null || phMedio === undefined ? null : Number(phMedio),
  };
}

module.exports = { avaliarMistura, regraDoPar, REGRAS };
