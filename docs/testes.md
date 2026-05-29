# Guia de Testes e QA — Gview Platform

Este documento descreve a estratégia completa de testes automatizados da plataforma Gview, cobrindo os três níveis exigidos pelo projeto: **unitários**, **integração** e **end-to-end**. Todos os testes estão implementados e passando (status ✅).

---

## Visão Geral da Suíte

| Nível | Ferramenta | Arquivos | Casos de Teste |
|-------|-----------|----------|----------------|
| Unitário (backend) | Vitest | 7 arquivos | 29 casos (CT-U01 a CT-U29) |
| Integração (backend) | Vitest + Supertest | 7 arquivos | 34 casos (CT-I01 a CT-I34) |
| Unitário (frontend) | Vitest + RTL | 4 arquivos | 25 casos (CT-F01 a CT-F25) |
| End-to-End | Playwright | 5 arquivos | 10 casos (CT-E01 a CT-E10) |
| **Total** | | **23 arquivos** | **98 casos** |

---

## 1. Pré-requisitos

Antes de rodar qualquer teste, garanta que o ambiente está configurado:

```bash
# Na pasta backend — instale dependências e configure o banco
cd backend
npm install
cp .env.example .env          # Preencha JWT_SECRET e RAWG_API_KEY
npx prisma db push            # Cria o banco SQLite
node prisma/seed.js           # Popula dados iniciais (opcional para testes)

# Na pasta frontend — instale dependências
cd ../frontend
npm install
npx playwright install chromium  # Necessário apenas para E2E
```

---

## 2. Testes Unitários e de Integração (Backend)

Os testes do backend utilizam **Vitest** como test runner e **Supertest** para simular requisições HTTP.

### Como rodar

```bash
cd backend

# Rodar tudo (unitários + integração)
npm test

# Rodar apenas testes unitários
npm run test:unit

# Rodar apenas testes de integração
npm run test:integration

# Gerar relatório de cobertura (abre em coverage/index.html)
npm run test:coverage
```

### Estrutura dos arquivos de teste

```
backend/tests/
├── unit/
│   ├── slugify.test.js              # CT-U01 a CT-U04 — Função slugify
│   ├── auth.middleware.test.js      # CT-U05 a CT-U09 — Middlewares JWT
│   ├── games.controller.test.js     # CT-U10 a CT-U15 — Controller de jogos
│   ├── reviews.controller.test.js   # CT-U16 a CT-U21 — Controller de reviews
│   ├── collections.controller.test.js # CT-U22 a CT-U24 — Controller de coleções
│   ├── submissions.controller.test.js # CT-U25 a CT-U26 — Controller de submissões
│   └── gamejams.controller.test.js  # CT-U27 a CT-U29 — Controller de game jams
└── integration/
    ├── games.test.js                # CT-I01 a CT-I05 — Rotas de jogos
    ├── auth.test.js                 # CT-I06 a CT-I12 — Rotas de autenticação
    ├── reviews.test.js              # CT-I13 a CT-I16 — Rotas de reviews
    ├── submissions.test.js          # CT-I17 a CT-I20 — Rotas de submissões
    ├── gamejams.test.js             # CT-I21 a CT-I25 — Rotas de game jams
    ├── collections.test.js          # CT-I26 a CT-I30 — Rotas de coleções
    └── wishlist.test.js             # CT-I31 a CT-I34 — Rotas de wishlist
```

### O que cada grupo testa

**Testes Unitários** validam funções e controllers de forma isolada, com o Prisma e dependências externas mockadas via `vi.mock`. Cada teste verifica apenas a lógica do módulo em questão, sem tocar banco de dados real.

**Testes de Integração** sobem a aplicação Express completa via Supertest e executam requisições HTTP reais contra um banco SQLite de teste em memória. Verificam o comportamento de ponta a ponta das rotas, incluindo autenticação JWT, autorização por role (PLAYER/ADMIN) e respostas de erro.

---

## 3. Testes Unitários (Frontend)

O frontend utiliza **Vitest** como test runner e **React Testing Library (RTL)** para renderizar e interagir com componentes React em ambiente jsdom.

### Como rodar

```bash
cd frontend

# Rodar testes unitários
npm test

# Gerar relatório de cobertura (abre em coverage/index.html)
npm run test:coverage
```

### Estrutura dos arquivos de teste

```
frontend/src/tests/
├── setup.js                   # Configuração global do RTL (@testing-library/jest-dom)
├── GameCard.test.jsx           # CT-F01 a CT-F07 — Componente GameCard
├── Login.test.jsx              # CT-F08 a CT-F13 — Página de Login
├── Register.test.jsx           # CT-F14 a CT-F19 — Página de Cadastro
└── AuthContext.test.jsx        # CT-F20 a CT-F25 — Context de autenticação
```

---

## 4. Testes End-to-End (Playwright)

Os testes E2E simulam o comportamento de um usuário real no navegador Chrome, cobrindo os fluxos críticos da aplicação.

### Como rodar

```bash
cd frontend

# Opção 1 — Playwright sobe o Vite automaticamente (recomendado para apresentação)
npm run test:e2e

# Opção 2 — Servidor já rodando, execute apenas os testes
# (necessário ter rodado `npm run dev` no frontend e no backend)
npx playwright test

# Ver relatório visual HTML após execução
npx playwright show-report

# Modo interativo (útil para debug)
npm run test:e2e:ui
```

> **Nota:** O `playwright.config.js` está configurado com `webServer` e `reuseExistingServer: true`. Isso significa que o Playwright tentará subir o Vite automaticamente se ele não estiver rodando, ou reutilizará o servidor existente se já estiver ativo. O backend precisa estar rodando separadamente (`cd backend && npm run dev`).

### Estrutura dos arquivos E2E

```
frontend/e2e/
├── home.spec.js          # CT-E01 a CT-E03 — Página inicial
├── auth.spec.js          # CT-E04 a CT-E07 — Fluxos de login e registro
├── gamejams.spec.js      # CT-E08 — Página de Game Jams
├── collections.spec.js   # CT-E09 — Página de coleções
└── submit.spec.js        # CT-E10 — Formulário de submissão
```

---

## 5. Relatório de Cobertura de Código

### Backend

```bash
cd backend && npm run test:coverage
# Relatório HTML gerado em: backend/coverage/index.html
```

A meta de cobertura está configurada no `vitest.config.js` do backend.

### Frontend

```bash
cd frontend && npm run test:coverage
# Relatório HTML gerado em: frontend/coverage/index.html
```

A meta de cobertura está configurada no bloco `test.coverage` do `vite.config.js`.

---

## 6. Análise Estática de Qualidade (SonarQube / Codacy)

Para gerar o relatório de qualidade de código (complexidade, duplicação, code smells, vulnerabilidades), recomendamos o **Codacy** por integração direta com GitHub:

1. Acesse [codacy.com](https://app.codacy.com) e faça login com GitHub
2. Adicione o repositório do Gview
3. O Codacy analisará automaticamente a cada push e gerará métricas de qualidade
4. Copie o badge de qualidade gerado e adicione ao `README.md`

Alternativamente, o **CodeClimate** oferece a mesma integração em [codeclimate.com](https://codeclimate.com).

---

## 7. Rodando tudo de uma vez (raiz do projeto)

A partir da pasta raiz do projeto:

```bash
# Instalar todas as dependências
npm run install:all

# Rodar backend + frontend simultaneamente (requer concurrently)
npm install
npm run dev

# Rodar toda a suíte de testes (backend + frontend unitários)
npm run test:all

# Rodar E2E separadamente (backend deve estar rodando)
npm run test:e2e
```
