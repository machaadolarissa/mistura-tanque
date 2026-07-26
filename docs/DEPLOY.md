# Deploy gratuito (acesso remoto)

O app já está pronto para internet.

- **No PC:** salva em `data/dados.json`
- **No deploy:** usa **Turso** (banco SQLite na nuvem, free) com as variáveis de ambiente

---

## Opções gratuitas

| Serviço | Função | Nota |
|---------|--------|------|
| **Render** | Hospeda o site | Free; pode “dormir” ~15 min sem uso |
| **Turso** | Banco de dados | Free; dados ficam salvos |
| Railway | App (+ às vezes banco) | Créditos free; regras mudam |
| Fly.io | App | Free limitado |
| Glitch | App rápido | Mais frágil |

**Recomendado para o grupo:** Render + Turso.

---

## 1) Criar banco Turso (grátis)

1. Conta em https://turso.tech  
2. Crie um database (ex.: `mistura-tanque`)  
3. Em **Connect**, copie:
   - URL (`libsql://....turso.io`) → `TURSO_DATABASE_URL`
   - Token → `TURSO_AUTH_TOKEN`

---

## 2) Subir o código no GitHub

```bash
cd ~/Documentos/projeto-integrador-agro
git init
git add .
git commit -m "Mistura no Tanque com deploy"
# depois: crie o repo no GitHub e faça push
```

---

## 3) Deploy no Render

1. https://render.com → login com GitHub  
2. **New → Web Service** → escolha o repositório  
3. Preencha:
   - Build: `npm install`
   - Start: `npm start`
   - Plano: **Free**
4. **Environment** (obrigatório):
   - `TURSO_DATABASE_URL` = URL do Turso
   - `TURSO_AUTH_TOKEN` = token do Turso
   - `NODE_VERSION` = `20`
5. Create → espere ficar **Live**
6. Abra `https://SEU-APP.onrender.com`

Confira: `https://SEU-APP.onrender.com/api/health`  
Deve mostrar `"banco":"turso"`.

Há também um `render.yaml` na raiz (opcional, Blueprint).

---

## 4) Sensor apontando para a nuvem

```bash
API_URL=https://SEU-APP.onrender.com/api/ph npm run sensor
```

---

## Local (sem Turso)

```bash
npm install
npm start
```

Não precisa criar banco: usa JSON automaticamente.

Para testar Turso no PC, crie `.env` (veja `.env.example`).

---

## Atenção

- No Render free, a **primeira** abertura do dia pode demorar ~1 minuto (serviço acordando).
- Sem Turso no Render, os dados **não ficam confiáveis** (disco temporário).
