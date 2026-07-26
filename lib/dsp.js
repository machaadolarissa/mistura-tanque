function mediaMovel(valores) {
  if (!Array.isArray(valores) || valores.length === 0) {
    return null;
  }
  const soma = valores.reduce((acc, n) => acc + Number(n), 0);
  return soma / valores.length;
}

function phForaDaFaixaIdeal(ph, min = 5, max = 7) {
  if (ph === null || ph === undefined) return false;
  return ph < min || ph > max;
}

module.exports = { mediaMovel, phForaDaFaixaIdeal };
