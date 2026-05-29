# Casos de Uso — Gview Platform

## UC-01: Registrar Conta
**Ator:** Visitante  
**Pré-condições:** Usuário não autenticado  
**Fluxo Principal:** Usuário preenche nome, e-mail e senha → sistema valida dados → cria conta → retorna token JWT  
**Fluxos Alternativos:** E-mail já cadastrado → erro 409 | Campos faltantes → erro 400  
**Pós-condições:** Conta criada, usuário autenticado  

## UC-02: Autenticar (Login)
**Ator:** Usuário registrado  
**Pré-condições:** Conta existente  
**Fluxo Principal:** Usuário informa e-mail e senha → sistema valida credenciais → retorna token JWT  
**Fluxos Alternativos:** Credenciais inválidas → erro 401  
**Pós-condições:** Token JWT gerado, sessão iniciada  

## UC-03: Atualizar Perfil
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido  
**Fluxo Principal:** Usuário atualiza nome → sistema persiste alteração → retorna dados atualizados  
**Fluxos Alternativos:** Token inválido → erro 401  
**Pós-condições:** Perfil atualizado  

## UC-04: Excluir Conta
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido  
**Fluxo Principal:** Usuário confirma exclusão → sistema remove conta e dados relacionados (cascade)  
**Pós-condições:** Conta e dados do usuário removidos  

## UC-05: Listar Jogos / Catálogo
**Ator:** Visitante ou Usuário  
**Pré-condições:** Nenhuma  
**Fluxo Principal:** Usuário acessa catálogo → sistema retorna lista de jogos (com fallback mock se vazio)  
**Fluxos Alternativos:** Filtro por status (FEATURED, AVAILABLE, COMING_SOON)  
**Pós-condições:** Lista de jogos exibida  

## UC-06: Ver Detalhes de Jogo
**Ator:** Visitante ou Usuário  
**Pré-condições:** Nenhuma  
**Fluxo Principal:** Usuário acessa página de jogo via slug → sistema retorna dados completos + reviews  
**Fluxos Alternativos:** Slug inexistente → erro 404  
**Pós-condições:** Detalhes do jogo exibidos  

## UC-07: Criar Jogo (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin preenche dados do jogo (título, descrição, capa, gênero) → sistema valida, gera slug → persiste jogo  
**Fluxos Alternativos:** Título duplicado → erro 409 | Campos obrigatórios ausentes → erro 400  
**Pós-condições:** Jogo cadastrado no catálogo  

## UC-08: Atualizar Jogo (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN, jogo existente  
**Fluxo Principal:** Admin edita campos do jogo → sistema persiste alterações  
**Fluxos Alternativos:** Jogo não encontrado → erro 404  
**Pós-condições:** Jogo atualizado  

## UC-09: Remover Jogo (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin confirma exclusão → sistema remove jogo  
**Fluxos Alternativos:** Jogo não encontrado → erro 404  
**Pós-condições:** Jogo removido do catálogo  

## UC-10: Submeter Jogo (Formulário Público)
**Ator:** Desenvolvedor  
**Pré-condições:** Nenhuma (formulário público)  
**Fluxo Principal:** Desenvolvedor preenche dados do jogo (título, descrição, e-mail de contato) → sistema cria submissão com status PENDING  
**Fluxos Alternativos:** Campos obrigatórios ausentes → erro 400  
**Pós-condições:** Submissão criada com status PENDING  

## UC-11: Revisar Submissão (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin lista submissões → aprova ou rejeita → sistema atualiza reviewStatus  
**Fluxos Alternativos:** Submissão não encontrada → erro 404 | Status inválido → erro 400  
**Pós-condições:** Status da submissão atualizado  

## UC-12: Editar/Excluir Submissão (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin edita dados ou exclui submissão  
**Pós-condições:** Submissão atualizada ou removida  

## UC-13: Avaliar Jogo (Review)
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, jogo existente  
**Fluxo Principal:** Usuário atribui nota (1–5) e comentário → sistema persiste review  
**Fluxos Alternativos:** Nota inválida → erro 400 | Review duplicada → erro 409  
**Pós-condições:** Review criada e visível na página do jogo  

## UC-14: Editar Review Própria
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, review pertence ao usuário  
**Fluxo Principal:** Usuário edita nota/comentário → sistema persiste  
**Fluxos Alternativos:** Review de outro usuário → erro 403  
**Pós-condições:** Review atualizada  

## UC-15: Excluir Review Própria
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, review pertence ao usuário  
**Fluxo Principal:** Usuário solicita exclusão → sistema remove review  
**Fluxos Alternativos:** Review de outro usuário → erro 403  
**Pós-condições:** Review removida  

## UC-16: Adicionar à Lista de Desejos
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido  
**Fluxo Principal:** Usuário adiciona jogo à wishlist → sistema persiste entrada  
**Fluxos Alternativos:** Jogo já na wishlist → erro 409  
**Pós-condições:** Jogo adicionado à wishlist  

## UC-17: Remover da Lista de Desejos
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, jogo na wishlist  
**Fluxo Principal:** Usuário remove jogo → sistema deleta entrada  
**Fluxos Alternativos:** Jogo não na wishlist → erro 404  
**Pós-condições:** Jogo removido da wishlist  

## UC-18: Criar Game Jam (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin preenche dados (título, descrição, tema, datas) → sistema cria Game Jam  
**Fluxos Alternativos:** Campos obrigatórios ausentes → erro 400  
**Pós-condições:** Game Jam criada  

## UC-19: Editar Game Jam (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN, jam existente  
**Fluxo Principal:** Admin edita dados da jam → sistema persiste  
**Fluxos Alternativos:** Jam não encontrada → erro 404  
**Pós-condições:** Game Jam atualizada  

## UC-20: Excluir Game Jam (Admin)
**Ator:** Administrador  
**Pré-condições:** Token JWT com role ADMIN  
**Fluxo Principal:** Admin confirma exclusão → sistema remove jam e entradas associadas (cascade)  
**Pós-condições:** Jam removida  

## UC-21: Inscrever Jogo em Game Jam
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, jam ativa, jogo existente  
**Fluxo Principal:** Usuário seleciona jam e jogo → sistema cria GameJamEntry  
**Fluxos Alternativos:** Jogo já inscrito → erro 409  
**Pós-condições:** Inscrição registrada  

## UC-22: Criar Coleção Personalizada
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido  
**Fluxo Principal:** Usuário define nome, descrição e visibilidade → sistema cria coleção  
**Fluxos Alternativos:** Nome ausente → erro 400  
**Pós-condições:** Coleção criada  

## UC-23: Editar Coleção
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, coleção pertence ao usuário  
**Fluxo Principal:** Usuário edita nome/descrição/visibilidade → sistema persiste  
**Fluxos Alternativos:** Coleção de outro usuário → erro 403  
**Pós-condições:** Coleção atualizada  

## UC-24: Excluir Coleção
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, coleção pertence ao usuário  
**Fluxo Principal:** Usuário confirma exclusão → sistema remove coleção e itens (cascade)  
**Fluxos Alternativos:** Coleção de outro usuário → erro 403  
**Pós-condições:** Coleção removida  

## UC-25: Adicionar/Remover Jogo de Coleção
**Ator:** Usuário autenticado  
**Pré-condições:** Token JWT válido, coleção pertence ao usuário  
**Fluxo Principal:** Usuário adiciona ou remove jogo → sistema persiste CollectionItem  
**Fluxos Alternativos:** Jogo já na coleção → erro 409 | Jogo não encontrado → erro 404  
**Pós-condições:** Item adicionado ou removido  
