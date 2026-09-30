# Conferência da entrega

Aluno: João Vitor Andreata.
Revisão técnica: 30/09/2026.
Site: https://site-autentica-o-frank.pages.dev.

Esta revisão segue os requisitos detalhados da solicitação atual. As marcações mostram o que foi conferido e mantêm os limites dos testes. O enunciado integral da disciplina não estava disponível na conversa recuperada.

## Repositório e publicação

- [x] Repositório atual e deploy inspecionados antes das alterações. A versão encontrada foi fb94be4, publicada em 29/09.
- [x] Estrutura public/ e functions/ preservada. Nenhum package.json, package-lock.json, node_modules ou arquivo de configuração Wrangler foi encontrado.
- [x] Dashboard próprio inspirado no Light Bootstrap Dashboard, com Google/GitHub, perfil via /api/me e logout POST. Atende ao formato autorizado na solicitação atual.
- [x] Sem páginas ou assets de demonstração sobrando no projeto.
- [x] Cloudflare Pages: branch main, framework None, build command vazio, saída public, root vazio e publicação automática habilitada.
- [x] PUBLIC_BASE_URL exata; GOOGLE_CLIENT_ID e GITHUB_CLIENT_ID correspondem aos apps conferidos.
- [x] GOOGLE_CLIENT_SECRET e GITHUB_CLIENT_SECRET aparecem como Secret e Value encrypted. Os valores não foram abertos nem copiados.
- [x] Binding D1 chamado DB. As rotas publicadas inseriram e consultaram dados de teste nesse banco; o binding está ativo no deploy.
- [x] /api/health respondeu 200 com status ok e no-store.
- [x] Regra .gitattributes impede conversão automática dos PDFs pelo Git no Windows.

## OAuth, banco e sessão

- [x] Somente google e github são aceitos pelo backend.
- [x] PKCE S256, state, nonce para Google, transação de dez minutos no D1 e cookie __Host-oauth-tx protegido.
- [x] Consumo atômico por DELETE RETURNING, conferindo provedor, resumos do cookie e state, e expiração.
- [x] Google: callback exato, somente openid email profile, app externo em Testando e conta do aluno cadastrada como testador.
- [x] Google: discovery/JWKS e verificação RS256, issuer, audience, exp, iat, nonce e subject no código. Login real funcionou nesta revisão.
- [x] GitHub: homepage e callback exatos, Device Flow e wildcard desativados, sem scopes adicionais.
- [x] GitHub: /user, ID numérico como subject e DELETE /applications/.../grant com 204 antes da sessão local. Login real funcionou; a ordem e a exigência de 204 foram verificadas no código.
- [x] Tabelas oauth_transactions e sessions, com índices de expires_at, conferidas diretamente no D1. Definições registradas no arquivo 04.
- [x] context.env.DB é recebido por desestruturação do contexto. Nenhum identificador de banco foi encontrado no código.
- [x] Sessão opaca de oito horas; somente o resumo SHA-256 fica no D1.
- [x] Cookie __Host-session com Path=/, Secure, HttpOnly, SameSite=Strict e sem Domain.
- [x] /api/me devolve perfil mínimo com no-store; sessão válida deu 200, ausente ou expirada deu 401 nos testes HTTP.
- [x] Logout somente POST, Origin exato, remoção da sessão e expiração do cookie. Origin inválido deu 403 e preservou a sessão; GET deu 405.
- [x] Cookie revogado reutilizado deu 401. Dados sintéticos de teste removidos ao terminar.
- [x] Logs emitidos pelo código não incluem tokens, secrets, códigos ou cookies. Mensagens de falha foram inspecionadas no stream; metadados privados da plataforma não foram publicados.

## Evidências

A pasta public/entrega1/ contém exatamente estes oito arquivos:

- [x] 01-pages-configuracao.pdf: configuração Pages legível; comparada com o painel atual.
- [x] 02-google-retorno.txt: callback exato e conferência do cliente Google.
- [x] 03-github-retorno.txt: homepage, callback e opções conferidos no OAuth App.
- [x] 04-d1-esquema.txt: tabelas, índices e definições SQL reais, sem linhas de usuários.
- [x] 05-inicio-login-google.pdf: duas páginas, captura e cabeçalhos saneados. Conta e parâmetros temporários ocultos.
- [x] 06-inicio-login-github.pdf: três páginas, captura, cookie e cabeçalhos saneados. Valores temporários ocultos.
- [x] 07-testes-falha.md: resultados medidos em produção, métodos e limites explícitos.
- [x] 08-aceitacao.md: esta conferência, sem matrícula ou identificação privada de conta.

Os PDFs foram renderizados e lidos por completo. As imagens extraídas já contêm as tarjas; os PDFs não têm anexos, anotações ou texto extraído com valores sensíveis. Não foram encontrados Client Secret, access token, id_token, authorization code, cookie de sessão, state, nonce ou code_verifier reais nos arquivos atuais.

## Limites e revisão do aluno

- [x] Os logins reais e as saídas dos dois provedores foram observados no navegador em 30/09. Os testes HTTP com sessões e transações sintéticas estão identificados no arquivo 07.
- [x] Reutilização de transação consumida e expiração testadas com dados sintéticos. A repetição de callback após login real, especificamente, permanece como confirmação histórica do aluno em 29/09, sem nova captura em 30/09.
- [x] Local Storage e Session Storage vazios após os dois logins constavam da revisão de 29/09. A inspeção não foi repetida nesta revisão; o código atual não salva tokens em armazenamento Web.
- [ ] Aluno conferir a entrega final contra o enunciado integral, especialmente a seção 7.2 citada na revisão anterior, e confirmar o aceite atualizado. Não foi criada assinatura em seu nome em 30/09.

O aceite textual de João Vitor Andreata em 29/09 foi mantido no histórico Git. Ele não foi transformado em assinatura desta revisão. O aluno também deve conseguir explicar que arquivos estáticos permanecem públicos e que a sessão protege a API; a explicação está no README.

A revisão anterior registrava uso de Node em ferramentas auxiliares. Não se declara que isso nunca ocorreu. O projeto entregue continua sem Node/npm/Wrangler como dependência ou etapa de build definida pelo aluno. A compilação interna do Cloudflare aparece no log da própria plataforma.

Se o computador for compartilhado, encerrar as contas administrativas depois da revisão. Não foram encerradas automaticamente, pois o aluno está acompanhando o trabalho.
