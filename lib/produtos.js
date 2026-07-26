const PRODUTOS = [
  {
    id: "herbicida_glifosato",
    nome: "Herbicida (tipo glifosato)",
    tipo: "herbicida",
    phIdeal: { min: 4.5, max: 6.5 },
  },
  {
    id: "herbicida_24d",
    nome: "Herbicida (tipo 2,4-D)",
    tipo: "herbicida",
    phIdeal: { min: 5, max: 7 },
  },
  {
    id: "inseticida_piretroide",
    nome: "Inseticida (piretroide)",
    tipo: "inseticida",
    phIdeal: { min: 5, max: 7 },
  },
  {
    id: "fungicida_cobre",
    nome: "Fungicida cúprico (cobre)",
    tipo: "fungicida",
    phIdeal: { min: 6, max: 7.5 },
  },
  {
    id: "oleo_mineral",
    nome: "Óleo mineral / vegetal",
    tipo: "adjuvante",
    phIdeal: { min: 5, max: 8 },
  },
  {
    id: "espalhante",
    nome: "Adjuvante espalhante",
    tipo: "adjuvante",
    phIdeal: { min: 5, max: 8 },
  },
  {
    id: "fertilizante_foliar",
    nome: "Fertilizante foliar",
    tipo: "fertilizante",
    phIdeal: { min: 5, max: 6.5 },
  },
  {
    id: "biologico",
    nome: "Inseticida biológico (Bacillus)",
    tipo: "biologico",
    phIdeal: { min: 6, max: 7.5 },
  },
  {
    id: "calda_sulfocalcica",
    nome: "Calda sulfocálcica",
    tipo: "fungicida",
    phIdeal: { min: 7, max: 9 },
  },
];

function listarProdutos() {
  return PRODUTOS.map(({ id, nome, tipo }) => ({ id, nome, tipo }));
}

function buscarProduto(id) {
  return PRODUTOS.find((p) => p.id === id) || null;
}

module.exports = { PRODUTOS, listarProdutos, buscarProduto };
