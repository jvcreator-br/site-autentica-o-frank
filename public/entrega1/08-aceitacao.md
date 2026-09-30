# Lista de aceitação

Aluno: João Vitor Andreata.
Site: https://site-autentica-o-frank.pages.dev.
Conferência técnica e comparação com o enunciado: 30/09/2026.

Lista da seção 17 da avaliação. As ressalvas estão abaixo; uma marcação técnica não substitui a confirmação pessoal do aluno.

- [x] o site é servido pelo endereço pages.dev atribuído à equipe;
- [x] os arquivos estáticos e as Functions compartilham a mesma origem;
- [x] o projeto foi publicado por integração com GitHub;
- [ ] a equipe não instalou nem executou Node.js, npm, npx ou Wrangler;
- [x] cada provedor usa uma URL de retorno própria e exata;
- [x] os pedidos de autorização usam código e PKCE S256;
- [x] a Function apresenta o Client Secret correto somente na troca de tokens;
- [x] o retorno recusa uma transação ausente, expirada, alterada ou reutilizada;
- [x] o id_token do Google só produz uma sessão depois da validação criptográfica e semântica;
- [x] o access_token do GitHub é usado somente para consultar /user e a autorização é revogada antes da criação da sessão;
- [x] o cookie de sessão é opaco, Secure, HttpOnly, SameSite=Strict e não possui Domain;
- [x] o D1 guarda o resumo do cookie, não seu valor bruto;
- [x] /api/me devolve somente o perfil necessário;
- [x] o logout confere Origin, remove a sessão e expira o cookie;
- [x] um cookie revogado não restaura a sessão;
- [x] tokens e segredos não aparecem no HTML, nas URLs salvas, no armazenamento Web ou nos registros;
- [x] a dupla consegue explicar por que os arquivos estáticos permanecem públicos;
- [x] as sessões administrativas foram encerradas no computador compartilhado. Não se aplica: o aluno confirmou que este é seu computador pessoal.

## Conferência e ressalvas

- A seção 7.2 permite adaptar index.html ou criar a página mínima; a página 3 também admite uma estrutura escolhida que o aluno saiba explicar. O dashboard atual foi mantido com public/ e functions/ na raiz, login dos dois provedores e logout POST. Não há template de demonstração nem dependências de pacotes no projeto.
- Pages: main, framework None, build command vazio, saída public, root vazio. As Functions foram compiladas no deploy de produção após binding e secrets. DB ativo, duas tabelas e dois índices conferidos no D1; nenhum identificador de banco no código.
- Google: cliente Web, retorno HTTPS único e exato, apenas openid email profile, app em teste e conta do aluno cadastrada como testador. GitHub: homepage e retorno exatos, Device Flow desativado e nenhum scope adicional.
- Os Client Secrets estão criptografados no Pages. A frase sobre troca de tokens deve ser lida com a seção 13.5: a revogação GitHub também exige Client ID e Client Secret em Basic e access_token no corpo. O código faz essa chamada e exige 204 antes de criar sessão. Nada disso é exposto ao navegador.
- As seis falhas e a transação expirada foram confirmadas pelo aluno em 29/09 no registro anterior. Em 30/09 foram feitos testes HTTP adicionais com sessões e transações sintéticas. O arquivo 07 mantém preparação, pedido, resultado esperado, observado, datas e limites. Não se afirma nova repetição de callback após autorização real bem-sucedida.
- Os dois logins e as saídas reais foram observados em 30/09. As capturas de 29/09 registravam /api/me 200 após ambos os logins, 401 após logout e Local Storage e Session Storage vazios. A revisão de 30/09 inspecionou as mensagens do código no stream Cloudflare sem tokens, códigos ou segredos; URLs e metadados privados da plataforma não foram copiados.
- O critério sobre nunca executar Node permanece desmarcado: o histórico registra uso de Node em ferramentas auxiliares de revisões assistidas. Isso não pode ser apagado nem declarado como se não tivesse ocorrido. O projeto entregue não contém package.json, package-lock.json, node_modules ou configuração Wrangler, e não define build com essas ferramentas.
- Arquivos estáticos de public/ continuam acessíveis a qualquer visitante. A sessão protege /api/me, que valida o resumo do cookie no D1. Ocultar links não torna HTML, CSS ou evidências privados. O aluno confirmou em 30/09 que entende essa explicação. O aceite individual substitui a referência à dupla neste item.
- O aluno confirmou em 30/09 que este computador é pessoal. A condição sobre encerrar sessões em computador compartilhado não se aplica a esta revisão; não se declara que as contas administrativas foram encerradas. Ao utilizar um computador compartilhado, encerrar Google, GitHub e Cloudflare ao terminar.

## Identificação, assinatura e rotação

Entrega individual, confirmada pelo aluno em 30/09/2026.
Responsável pela rotação dos dois Client Secrets: João Vitor Andreata, titular do projeto e dos apps. Nenhum segredo precisa ser informado.

Assinatura textual já registrada pelo aluno no histórico: **João Vitor Andreata - 29/09/2026**.
Esse aceite histórico cobre os resultados e ressalvas daquela data. Foi preservado como registro anterior, sem criar uma nova assinatura em 30/09.

Aceite atualizado: o aluno confirmou expressamente em 30/09/2026 que aceita a lista com as ressalvas registradas, incluindo o uso histórico de Node em ferramentas auxiliares, e que entende a distinção entre arquivos públicos e API protegida por sessão.

Assinatura textual autorizada pelo aluno: **João Vitor Andreata - 30/09/2026**.
Entrega individual. Este aceite preserva a ressalva do critério Node desmarcado; não declara esse item como cumprido e não constitui garantia de nota ou aprovação.
