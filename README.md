# site-autentica-o-frank

Trabalho de autenticação com Google, GitHub, Cloudflare Pages e D1.

Site: https://site-autentica-o-frank.pages.dev

O dashboard usa HTML, CSS e JavaScript. O Light Bootstrap Dashboard serviu como referência visual. Não há etapa de build, dependências npm ou configuração do Wrangler no projeto.

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
