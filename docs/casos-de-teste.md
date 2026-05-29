# Casos de Teste — Gview Platform

> **Rastreabilidade:** Cada caso de teste referencia o(s) Caso(s) de Uso correspondentes (UC-XX), conforme documentado em `docs/casos-de-uso.md`.

---

## Testes Unitários (Backend)

| ID | Objetivo | UC | Pré-condições | Entrada | Resultado Esperado | Resultado Obtido | Status |
|----|---------|----|---------------|---------|-------------------|------------------|--------|
| CT-U01 | Slugify: string básica | UC-07 | — | `"Hollow Knight"` | `"hollow-knight"` | `"hollow-knight"` | ✅ |
| CT-U02 | Slugify: remoção de acentos | UC-07 | — | `"Ação & Aventura"` | `"ao-aventura"` | `"ao-aventura"` | ✅ |
| CT-U03 | Slugify: múltiplos hífens | UC-07 | — | `"a--b---c"` | `"a-b-c"` | `"a-b-c"` | ✅ |
| CT-U04 | Slugify: string vazia | UC-07 | — | `""` | `""` | `""` | ✅ |
| CT-U05 | authMiddleware: sem token → 401 | UC-02 | — | Request sem header Authorization | Status 401 | Status 401, `{ error: "Token de autenticação não fornecido" }` | ✅ |
| CT-U06 | authMiddleware: token inválido → 401 | UC-02 | — | `"Bearer invalidtoken"` | Status 401 | Status 401, `{ error: "Token inválido ou expirado" }` | ✅ |
| CT-U07 | authMiddleware: token válido → next() | UC-02 | — | JWT assinado com secret correto | `next()` chamado, `req.user` populado | `next()` invocado, `req.user = { id, email, role }` | ✅ |
| CT-U08 | adminOnly: PLAYER → 403 | UC-07, UC-11 | `req.user` populado | `user.role = "PLAYER"` | Status 403 | Status 403, `{ error: "Acesso restrito a administradores" }` | ✅ |
| CT-U09 | adminOnly: ADMIN → next() | UC-07, UC-11 | `req.user` populado | `user.role = "ADMIN"` | `next()` chamado | `next()` invocado | ✅ |
| CT-U10 | listGames: banco com dados → retorna jogos | UC-05 | prisma mockado | `prisma.game.findMany` retorna array | `body.data` igual ao mock | `body.data` = array mockado, `source = "db"` | ✅ |
| CT-U11 | listGames: banco vazio → fallback mock | UC-05 | prisma mockado | `prisma` retorna `[]` | `source = "mock"` | `source = "mock"`, dados estáticos retornados | ✅ |
| CT-U12 | createGame: sem título → 400 | UC-07 | prisma mockado | `{ shortDescription: "test" }` | Status 400 | Status 400, `{ error: "título é obrigatório" }` | ✅ |
| CT-U13 | createGame: sucesso → 201 + body | UC-07 | prisma mockado | `{ title, shortDescription }` | Status 201, body com id | Status 201, `body.id` presente, `body.slug` gerado | ✅ |
| CT-U14 | createGame: slug duplicado → 409 | UC-07 | prisma mockado | `prisma` lança P2002 | Status 409 | Status 409, `{ error: "título ou slug já existe" }` | ✅ |
| CT-U15 | deleteGame: não existe → 404 | UC-09 | prisma mockado | `prisma` lança P2025 | Status 404 | Status 404, `{ error: "Jogo não encontrado" }` | ✅ |
| CT-U16 | createReview: sem gameId → 400 | UC-13 | prisma mockado | `{ rating: 5 }` | Status 400 | Status 400, erro de validação | ✅ |
| CT-U17 | createReview: rating > 5 → 400 | UC-13 | prisma mockado | `{ gameId, rating: 10 }` | Status 400 | Status 400, `{ error: "rating deve ser entre 1 e 5" }` | ✅ |
| CT-U18 | createReview: rating < 1 → 400 | UC-13 | prisma mockado | `{ gameId, rating: 0 }` | Status 400 | Status 400, `{ error: "rating deve ser entre 1 e 5" }` | ✅ |
| CT-U19 | createReview: duplicada → 409 | UC-13 | prisma mockado | `prisma` lança P2002 | Status 409 | Status 409, `{ error: "Você já avaliou este jogo" }` | ✅ |
| CT-U20 | updateReview: não é dono → 403 | UC-14 | prisma mockado | `review.userId ≠ req.user.id` | Status 403 | Status 403, `{ error: "Sem permissão" }` | ✅ |
| CT-U21 | deleteReview: dono → 204 | UC-15 | prisma mockado | `review.userId = req.user.id` | Status 204 | Status 204, sem body | ✅ |
| CT-U22 | createCollection: sem nome → 400 | UC-22 | prisma mockado | `{}` | Status 400 | Status 400, erro de validação | ✅ |
| CT-U23 | updateCollection: não é dono → 403 | UC-23 | prisma mockado | `collection.userId ≠ req.user.id` | Status 403 | Status 403, `{ error: "Sem permissão" }` | ✅ |
| CT-U24 | addGameToCollection: jogo já existe → 409 | UC-25 | prisma mockado | `prisma` lança P2002 | Status 409 | Status 409, `{ error: "Jogo já está na coleção" }` | ✅ |
| CT-U25 | createSubmission: sem campos → 400 | UC-10 | prisma mockado | `{ gameTitle: "Test" }` sem description/email | Status 400 | Status 400, erro de validação | ✅ |
| CT-U26 | updateSubmissionStatus: status inválido → 400 | UC-11 | prisma mockado | `{ status: "INVALID" }` | Status 400 | Status 400, `{ error: "Status inválido" }` | ✅ |
| CT-U27 | createGameJam: campos faltantes → 400 | UC-18 | prisma mockado | `{ title: "Test" }` | Status 400 | Status 400, erro de validação | ✅ |
| CT-U28 | joinGameJam: sem gameId → 400 | UC-21 | prisma mockado | `{}` | Status 400 | Status 400, erro de validação | ✅ |
| CT-U29 | joinGameJam: jogo já inscrito → 409 | UC-21 | prisma mockado | `prisma` lança P2002 | Status 409 | Status 409, `{ error: "Jogo já inscrito" }` | ✅ |

---

## Testes de Integração (Backend)

| ID | Objetivo | UC | Pré-condições | Entrada | Resultado Esperado | Resultado Obtido | Status |
|----|---------|----|---------------|---------|-------------------|------------------|--------|
| CT-I01 | GET /api/games → 200 + data array | UC-05 | Servidor rodando | GET sem auth | Status 200, `body.data` é array | Status 200, array de jogos | ✅ |
| CT-I02 | POST /api/games sem token → 401 | UC-07 | Servidor rodando | POST sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I03 | POST /api/games (admin) → 201 + id + slug | UC-07 | Token admin válido | `{ title, shortDescription }` | Status 201, id e slug presentes | Status 201, id e slug gerados | ✅ |
| CT-I04 | PUT /api/games/:id inválido → 404 | UC-08 | Token admin válido | PUT com id inexistente | Status 404 | Status 404 | ✅ |
| CT-I05 | DELETE /api/games/:id (admin) → 204 | UC-09 | Token admin válido, jogo existente | DELETE /api/games/:id | Status 204 | Status 204 | ✅ |
| CT-I06 | POST /api/auth/register → 201 + token | UC-01 | Email único | `{ name, email, password }` | Status 201, `body.token` existe | Status 201, JWT retornado | ✅ |
| CT-I07 | POST /api/auth/register email duplicado → 409 | UC-01 | Email já cadastrado | `{ name, email, password }` repetido | Status 409 | Status 409 | ✅ |
| CT-I08 | POST /api/auth/register sem campos → 400 | UC-01 | — | `{}` | Status 400 | Status 400 | ✅ |
| CT-I09 | POST /api/auth/login credenciais válidas → 200 + token | UC-02 | Conta existente | `{ email, password }` corretos | Status 200, `body.token` existe | Status 200, JWT retornado | ✅ |
| CT-I10 | POST /api/auth/login senha errada → 401 | UC-02 | Conta existente | `{ email, password }` errado | Status 401 | Status 401 | ✅ |
| CT-I11 | GET /api/auth/me sem token → 401 | UC-03 | — | GET sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I12 | GET /api/auth/me com token → 200 + user | UC-03 | Token válido | GET com Bearer token | Status 200, `body.user.email` correto | Status 200, dados do usuário | ✅ |
| CT-I13 | GET /api/reviews/game/:id → 200 + data | UC-13 | Jogo existente | GET /api/reviews/game/:id | Status 200, `body.data` é array | Status 200, array de reviews | ✅ |
| CT-I14 | POST /api/reviews sem auth → 401 | UC-13 | — | POST sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I15 | POST /api/reviews (auth) → 201 + rating | UC-13 | Token válido, jogo existente | `{ gameId, rating, comment }` | Status 201, rating correto | Status 201, review criada | ✅ |
| CT-I16 | POST /api/reviews duplicada → 409 | UC-13 | Token válido, review já criada | `{ gameId, rating }` repetido | Status 409 | Status 409 | ✅ |
| CT-I17 | POST /api/submissions → 201 + PENDING | UC-10 | — | `{ gameTitle, description, contactEmail }` | Status 201, `reviewStatus = PENDING` | Status 201, status PENDING | ✅ |
| CT-I18 | POST /api/submissions sem campos → 400 | UC-10 | — | `{}` | Status 400 | Status 400 | ✅ |
| CT-I19 | GET /api/submissions sem token → 401 | UC-11 | — | GET sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I20 | GET /api/submissions (admin) → 200 + array | UC-11 | Token admin válido | GET /api/submissions | Status 200 | Status 200, array de submissões | ✅ |
| CT-I21 | GET /api/gamejams → 200 + array | UC-18 | — | GET /api/gamejams | Status 200, array | Status 200, array de jams | ✅ |
| CT-I22 | POST /api/gamejams sem token → 401 | UC-18 | — | POST sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I23 | POST /api/gamejams (admin) → 201 + id | UC-18 | Token admin válido | `{ title, description, theme, startDate, endDate }` | Status 201, id presente | Status 201, jam criada | ✅ |
| CT-I24 | PUT /api/gamejams/:id → 200 + tema atualizado | UC-19 | Token admin válido, jam existente | `{ theme: "Space" }` | Status 200, `body.theme = "Space"` | Status 200, tema atualizado | ✅ |
| CT-I25 | DELETE /api/gamejams/:id → 204 | UC-20 | Token admin válido, jam existente | DELETE /api/gamejams/:id | Status 204 | Status 204 | ✅ |
| CT-I26 | GET /api/collections/my sem token → 401 | UC-22 | — | GET sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I27 | GET /api/collections/my (auth) → 200 + data | UC-22 | Token válido | GET /api/collections/my | Status 200, `body.data` é array | Status 200, coleções do usuário | ✅ |
| CT-I28 | POST /api/collections → 201 + name | UC-22 | Token válido | `{ name: "Favoritos" }` | Status 201, `body.name` correto | Status 201, coleção criada | ✅ |
| CT-I29 | POST /api/collections sem nome → 400 | UC-22 | Token válido | `{}` | Status 400 | Status 400 | ✅ |
| CT-I30 | DELETE /api/collections/:id → 204 | UC-24 | Token válido, coleção pertence ao usuário | DELETE /api/collections/:id | Status 204 | Status 204 | ✅ |
| CT-I31 | GET /api/wishlist/:userId sem token → 401 | UC-16 | — | GET sem Authorization | Status 401 | Status 401 | ✅ |
| CT-I32 | POST /api/wishlist → 201 | UC-16 | Token válido, jogo existente | `{ gameId }` | Status 201 | Status 201, entrada criada | ✅ |
| CT-I33 | POST /api/wishlist duplicada → 409 | UC-16 | Token válido, jogo já na wishlist | `{ gameId }` repetido | Status 409 | Status 409 | ✅ |
| CT-I34 | DELETE /api/wishlist/:gameId → 204 | UC-17 | Token válido, jogo na wishlist | DELETE /api/wishlist/:gameId | Status 204 | Status 204 | ✅ |

---

## Testes Unitários (Frontend)

| ID | Objetivo | UC | Pré-condições | Entrada | Resultado Esperado | Resultado Obtido | Status |
|----|---------|----|---------------|---------|-------------------|------------------|--------|
| CT-F01 | GameCard: exibe título do jogo | UC-05, UC-06 | — | `game.title = "Hollow Knight"` | Texto "Hollow Knight" visível | Texto renderizado no DOM | ✅ |
| CT-F02 | GameCard: exibe nome do estúdio | UC-05, UC-06 | — | `game.studioName = "Team Cherry"` | Texto "Team Cherry" visível | Texto renderizado no DOM | ✅ |
| CT-F03 | GameCard: link aponta para rota correta | UC-05, UC-06 | — | `game.slug = "hollow-knight"` | `href = "/game/hollow-knight"` | `href` correto no elemento `<a>` | ✅ |
| CT-F04 | GameCard: badge "em breve" em COMING_SOON | UC-05 | — | `game.status = "COMING_SOON"` | Badge "em breve" visível | Badge renderizado | ✅ |
| CT-F05 | GameCard: badge "destaque" em FEATURED | UC-05 | — | `game.status = "FEATURED"` | Badge "destaque" visível | Badge renderizado | ✅ |
| CT-F06 | GameCard: sem badges em AVAILABLE | UC-05 | — | `game.status = "AVAILABLE"` | Nenhum badge visível | queryByText retorna null | ✅ |
| CT-F07 | GameCard: placeholder quando coverUrl é nulo | UC-05 | — | `game.coverUrl = null` | `img.src` contém "picsum.photos" | src gerado com picsum | ✅ |
| CT-F08 | Login: exibe campo de e-mail | UC-02 | — | — | Input de e-mail visível | Input renderizado com label | ✅ |
| CT-F09 | Login: exibe campo de senha | UC-02 | — | — | Input de senha visível | Input renderizado com label | ✅ |
| CT-F10 | Login: exibe botão de entrar | UC-02 | — | — | Botão "Entrar" visível | Botão renderizado | ✅ |
| CT-F11 | Login: link para registro presente | UC-01 | — | — | Link "Criar conta" visível | Link renderizado | ✅ |
| CT-F12 | Login: chama login e redireciona | UC-02 | — | `email` e `password` preenchidos | `login()` chamado, navega para /profile | Mocks verificados, navigate("/profile") | ✅ |
| CT-F13 | Login: exibe erro quando falha | UC-02 | — | `login()` rejeita com erro | Mensagem de erro exibida | Texto de erro no DOM | ✅ |
| CT-F14 | Register: exibe os quatro campos | UC-01 | — | — | Quatro inputs visíveis | Todos os inputs renderizados | ✅ |
| CT-F15 | Register: erro quando senhas não coincidem | UC-01 | — | `password ≠ confirmPassword` | Mensagem "senhas não coincidem" | Erro exibido antes de chamar API | ✅ |
| CT-F16 | Register: erro senha curta | UC-01 | — | `password.length < 6` | Mensagem "pelo menos 6 caracteres" | Erro exibido antes de chamar API | ✅ |
| CT-F17 | Register: chama register e redireciona | UC-01 | — | Formulário válido | `register()` chamado, navega para /profile | Mocks verificados | ✅ |
| CT-F18 | Register: exibe erro quando falha | UC-01 | — | `register()` rejeita com erro | Mensagem de erro exibida | Texto de erro no DOM | ✅ |
| CT-F19 | Register: link para login presente | UC-01 | — | — | Link "Entrar" visível | Link renderizado | ✅ |
| CT-F20 | AuthContext: loading inicia true, termina false | UC-02 | Sem token no localStorage | — | `loading = false` após efeito | Estado atualizado corretamente | ✅ |
| CT-F21 | AuthContext: user null sem token | UC-02 | Sem token | — | `user = null` | `user` permanece null | ✅ |
| CT-F22 | AuthContext: isAdmin false sem auth | UC-02 | Sem usuário | — | `isAdmin = false` | `isAdmin` retorna false | ✅ |
| CT-F23 | AuthContext: carrega usuário do token | UC-02 | Token no localStorage | API retorna user ADMIN | `user.email` preenchido | User populado do /api/auth/me | ✅ |
| CT-F24 | AuthContext: isAdmin true para ADMIN | UC-02 | Token com role ADMIN | API retorna user com role ADMIN | `isAdmin = true` | isAdmin retorna true | ✅ |
| CT-F25 | AuthContext: logout quando token inválido | UC-02 | Token inválido no localStorage | API retorna erro | `user = null`, `token = null` | Logout executado automaticamente | ✅ |

---

## Testes End-to-End (Playwright)

| ID | Objetivo | UC | Pré-condições | Passos | Resultado Esperado | Resultado Obtido | Status |
|----|---------|----|---------------|--------|-------------------|------------------|--------|
| CT-E01 | Home carrega com título | UC-05 | Frontend rodando | Navegar para `/` | `page.title()` contém "Gview" | Título "Gview" no `<title>` | ✅ |
| CT-E02 | Home exibe navbar | UC-05 | Frontend rodando | Navegar para `/` | Elemento `<nav>` visível | Nav renderizado e visível | ✅ |
| CT-E03 | Home exibe footer | UC-05 | Frontend rodando | Navegar para `/` | Elemento `<footer>` visível | Footer renderizado e visível | ✅ |
| CT-E04 | Login: formulário visível | UC-02 | Frontend rodando | Navegar para `/login` | Inputs de email e senha visíveis | Inputs renderizados | ✅ |
| CT-E05 | Register: formulário visível | UC-01 | Frontend rodando | Navegar para `/register` | Inputs de email e senha visíveis | Inputs renderizados | ✅ |
| CT-E06 | Login: credenciais inválidas não redireciona | UC-02 | Frontend rodando | Preencher credenciais erradas e submeter | URL não contém `/profile` | URL permanece em `/login` | ✅ |
| CT-E07 | Rota protegida /profile redireciona ou permanece | UC-03 | Frontend rodando | Navegar para `/profile` sem auth | URL contém `profile` ou `login` | Rota protegida funcionando | ✅ |
| CT-E08 | /jams carrega página de Game Jams | UC-18 | Frontend rodando | Navegar para `/jams` | URL = `/jams`, texto "game jam" visível | Página carregada corretamente | ✅ |
| CT-E09 | /collections carrega ou redireciona | UC-22 | Frontend rodando | Navegar para `/collections` | URL contém `collections` ou `login` | Comportamento correto sem auth | ✅ |
| CT-E10 | /submit exibe campos do formulário | UC-10 | Frontend rodando | Navegar para `/submit` | Múltiplos inputs visíveis | Formulário renderizado | ✅ |
