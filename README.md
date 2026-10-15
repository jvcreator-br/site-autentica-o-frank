# site-autentica-o-frank

Trabalho de autenticação com Google, GitHub, Cloudflare Pages e D1.

Site: https://site-autentica-o-frank.pages.dev

A página inicial é o login. Ao entrar com Google ou GitHub, o usuário vai para `dashboard.html`; o botão Sair faz POST e volta ao login. O painel consulta `/api/me` antes de mostrar o perfil. Sem sessão válida, volta à página inicial.

O dashboard foi adaptado do [Light Bootstrap Dashboard v2.0.1](https://github.com/creativetimofficial/light-bootstrap-dashboard), da Creative Tim (commit de origem `651e5de95677efcdb84fe76a3096250e8743beb8`). A estrutura de sidebar, navbar, cards e footer vem do modelo `examples/dashboard.html`. Os CSS Bootstrap e Light Bootstrap Dashboard e a fonte Nucleo estão em `public/assets/`. A declaração da fonte foi reduzida a WOFF2, mantendo a fonte original. A licença MIT está em `LICENSE-light-bootstrap-dashboard.txt`, com os créditos preservados.

O perfil e o estado da conta substituem os dados fictícios do exemplo. A navegação móvel e a consulta da sessão usam JavaScript puro em `app.js`; `styles.css` contém os ajustes da aplicação. O site continua sem etapa de build. Os workflows de Actions usam ferramentas npm para validar HTML, revisar PRs e aplicar migrações D1. A configuração de migração é gerada separadamente no runner.

## Estrutura

- `public/`: dashboard e arquivos públicos da entrega.
- `functions/`: API, login, callback e logout.
- `public/entrega1/`: os oito arquivos de evidência, com valores sensíveis ocultos.

## Configuração no Cloudflare

Branch `main`, framework `None`, build command vazio, saída `public` e root vazio.

O binding D1 se chama `DB`. As Functions acessam esse binding pelo `env` recebido do contexto; nenhum identificador de banco fica no código. O esquema conferido no banco está em `public/entrega1/04-d1-esquema.txt`. Depois de alterar bindings ou variáveis, é preciso publicar novamente.

Variáveis: `PUBLIC_BASE_URL`, `GOOGLE_CLIENT_ID` e `GITHUB_CLIENT_ID`.
Secrets criptografados: `GOOGLE_CLIENT_SECRET` e `GITHUB_CLIENT_SECRET`.

`PUBLIC_BASE_URL` deve ser exatamente `https://site-autentica-o-frank.pages.dev`.

Google: callback `/oauth/callback/google`, somente `openid email profile`.
GitHub: homepage igual à URL do site, callback `/oauth/callback/github`, Device Flow e wildcard desativados, sem scopes adicionais.

## Como funciona

O login cria uma transação no D1 por dez minutos, com state e PKCE S256. O Google também usa nonce. O retorno consome a transação uma única vez antes de trocar o código.

O Google valida o ID token com discovery, JWKS e assinatura RS256, além de issuer, audience, exp, iat e nonce. O GitHub consulta `/user`, usa o ID numérico como subject e exige resposta 204 da revogação da autorização antes de criar a sessão local.

A sessão dura oito horas. O cookie é opaco; o D1 guarda seu resumo SHA-256. `/api/me` devolve apenas issuer, subject, email e displayName, com `Cache-Control: no-store`. Sem sessão válida, responde 401.

O logout aceita somente POST com Origin exatamente igual à URL do site. Remove a sessão do D1 e expira o cookie. O dashboard usa esse POST no botão de sair.

Arquivos estáticos continuam públicos. A sessão protege os dados retornados pela API; não transforma HTML, CSS e evidências em arquivos privados. Tokens dos provedores não são enviados ao frontend nem salvos em Local Storage ou Session Storage pelo código do projeto.

## Validação

Os resultados de produção, métodos e limites dos testes estão em `public/entrega1/07-testes-falha.md`. A conferência final está em `public/entrega1/08-aceitacao.md`. O histórico anterior foi preservado no Git.

Os PDFs são tratados como arquivos binários pelo Git para impedir alterações automáticas de fim de linha no Windows.

Referências: [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect), [revogação GitHub](https://docs.github.com/en/rest/apps/oauth-applications), [bindings Pages](https://developers.cloudflare.com/pages/functions/bindings/).


## Avaliação de GitHub Actions

- `.github/workflows/ci.yml`: segredos versionados, SQLite e HTML, em push e PR para main.
- `.github/workflows/revisao-ia.yml`: revisão por Copilot e comentário em PR do próprio repositório.
- `.github/workflows/migrar.yml`: migrações no D1 remoto somente em push na main com alteração de `migrations/`.
- `AVALIACAO.md`: evidências reais e pendências da avaliação.
- `wrangler.toml.example`: modelo do binding DB. Só renomear e preencher com os dados reais do banco; o modelo não é uma configuração de produção pronta.

### Configuração que falta no GitHub

Em Settings > Secrets and variables > Actions, cadastrar em **Secrets**:

- `COPILOT_PAT`: fine-grained PAT com Copilot Requests, validade de 7 dias e conta com Copilot ativo.
- `CLOUDFLARE_API_TOKEN`: token Cloudflare com D1 Edit limitado à conta necessária.
- `CLOUDFLARE_ACCOUNT_ID`: identificador da conta Cloudflare.

Na aba **Variables**, cadastrar `D1_DATABASE_NAME` e `D1_DATABASE_ID` com os dados do banco que já está vinculado ao site. Não criar outro banco para substituir o existente. O workflow gera `wrangler.ci.json` com o binding DB e usa essa configuração apenas nas migrações.

Em Settings > Branches, criar uma regra para `main`, exigir pull request e o status check `verificar`, e habilitar **Do not allow bypassing the above settings** para aplicar a regra ao proprietário também. Não exigir uma aprovação humana se não houver outro colaborador para revisar.

A integração usada para criar este PR não oferece alterações de secrets ou administração de proteção de branches. Essas configurações ainda precisam ser feitas pela interface do GitHub.

### Sequência restante da avaliação

1. Cadastrar secrets e variables e ativar a proteção da main. O CI já tem uma execução verde para que `verificar` apareça na seleção.
2. Repetir o erro SQL em um PR com a proteção ativa, confirmar o bloqueio e corrigir na mesma branch. Registrar a tentativa real de `git push` recusada; uma atualização por API não substitui essa evidência.
3. Depois de configurar COPILOT_PAT, testar uma consulta vulnerável em um PR e corrigir com `prepare(...).bind(nome)`. Nunca fazer merge do exemplo vulnerável.
4. Remover temporariamente `pull-requests: write`, observar o erro real no comentário e restaurar a permissão. Registrar uma crítica real à resposta da IA.
5. Preencher o `wrangler.toml` com o binding real. Após mesclar os workflows, criar um novo PR com `migrations/0002_adiciona_coluna.sql`, contendo `ALTER TABLE notas ADD COLUMN observacao TEXT;`.
6. Mesclar o PR aprovado. Conferir a saída de `PRAGMA table_info(notas)` no workflow migrar.
7. Mesclar uma mudança apenas de documentação e confirmar que migrar não disparou.
8. Atualizar AVALIACAO.md com os links restantes e entregá-lo por PR, passando pelo CI e pela IA.

Tokens, senhas e segredos devem ser inseridos somente nos campos de secrets do GitHub, nunca em arquivos, commits, comentários ou mensagens.
