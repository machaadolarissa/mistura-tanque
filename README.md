# Mistura no Tanque — Projeto Integrador VI

Ferramenta **web** para loja de insumos agrícolas:

> “Esses produtos podem ir juntos no tanque do pulverizador?”

Também mostra o **pH da água** (sensor **simulado**, sem hardware).

Feito de forma simples para qualquer pessoa do grupo entender.

---

## Como rodar

```bash
cd ~/Documentos/projeto-integrador-agro
npm install
npm start
```

Abra: **http://localhost:3000**

Em outro terminal:

```bash
npm run sensor
```

Abra: **http://localhost:3000/agua**

---

## Acesso remoto (deploy free)

O projeto já está preparado com **banco SQLite** (local) e **Turso** (nuvem gratuita).

Guia completo: **[docs/DEPLOY.md](docs/DEPLOY.md)**

Resumo: **Render** (site) + **Turso** (banco) → URL tipo `https://seu-app.onrender.com`

---

## Telas

| URL | Função |
|-----|--------|
| `/` | Escolhe 2–3 produtos e vê se pode misturar |
| `/agua` | pH ao vivo (IoT simulado) + média (DSP) |
| `/historico` | Últimas consultas |

---

## Demo rápida (1 minuto)

1. Em `/` escolha **Biológico** + **Fungicida cúprico** → resultado **NÃO misture** (vermelho).
2. Troque para **Glifosato** + **2,4-D** → **cuidado** (laranja).
3. Com `npm run sensor` ligado, vá em `/agua` e mostre o pH.
4. Volte na mistura com a opção “Usar pH atual” marcada.

---

## Pastas

```
lib/produtos.js          → lista de produtos
lib/compatibilidade.js   → regras de mistura (o “cérebro”)
lib/dsp.js               → média do pH
lib/banco.js             → salva JSON
simulador/sensor.js      → ESP32 falso (manda pH)
public/                  → páginas web
docs/                    → plano de negócios + roteiro
tests/                   → testes
```

---

## Quem mexe em quê

- Telas → `public/`
- Regras de mistura → `lib/compatibilidade.js`
- Sensor falso → `simulador/sensor.js`
- Texto da banca → `docs/`

---

## Ementa → projeto

| Requisito | Onde |
|-----------|------|
| Problema local | Misturas erradas no campo / balcão da loja |
| Embarcado / IoT | `simulador/sensor.js` (API pronta para ESP32) |
| Ingestão / nuvem | API + `data/dados.json` |
| DSP | média móvel do pH |
| Web + UI + acessibilidade | HTML, contraste, `aria-live` |
| Git / testes / CI | repo + `npm test` + GitHub Actions |
| Plano de negócios | `docs/PLANO_DE_NEGOCIOS.md` |

---

## Frase se perguntarem do sensor físico

> O nó IoT foi simulado em software, publicando na mesma API que um ESP32 com sensor de pH usaria em produção.
