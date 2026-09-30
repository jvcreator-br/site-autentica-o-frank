# Lista de aceitação — site-autentica-o-frank

Responsável: João Vitor Andreata.
Data da revisão: 29/09/2026. Resultados anteriores mantêm suas datas no arquivo 07.
Status: aceite do estudante registrado em 29/09/2026, com as ressalvas e pendências indicadas nesta lista; não constitui declaração de cumprimento integral.

- [x] O site é servido por https://site-autentica-o-frank.pages.dev.
- [x] Arquivos estáticos e Functions usam a mesma origem.
- [x] Publicação por integração com GitHub, branch main, saída public, comando de construção vazio.
- [ ] Incorporação do dashboard da disciplina confirmada. O painel atual tem implementação própria inspirada no Light Bootstrap Dashboard; falta confirmar o atendimento à seção 7.2.
- [x] O projeto não contém package.json, package-lock.json, node_modules ou wrangler.jsonc; as Functions usam APIs Web sem bibliotecas externas.
- [x] Cada provedor usa URL de retorno própria e exata.
- [x] Os pedidos de autorização usam código e PKCE S256, verificados nas respostas 302.
- [x] Os dois Client Secrets estão criptografados no painel Pages. Não foram copiados para os arquivos de evidência.
- [x] O código envia o Client Secret à troca de tokens. No GitHub, também o utiliza na autenticação Basic da revogação exigida pelo roteiro.
- [x] Testes de transação ausente, expirada, alterada e reutilizada concluídos conforme confirmação do aluno em 29/09/2026. Consultar os resultados e limites de verificação no arquivo 07.
- [x] O código valida assinatura RS256, emissor, audiência, expiração, instante de emissão e nonce do Google antes de criar sessão; login real concluído.
- [x] O código usa o token GitHub em /user e exige revogação da autorização com resposta 204 antes de criar sessão; login real concluído após a correção de User-Agent.
- [x] O cookie de sessão definido no código é opaco, Secure, HttpOnly, SameSite=Strict e não possui Domain.
- [x] O D1 guarda o resumo do cookie. A sessão sintética também foi inserida somente pelo resumo.
- [x] /api/me devolve issuer, subject, email e displayName, com no-store; autenticação confirmada pela página e por teste HTTP de sessão sintética.
- [x] O logout confere Origin, remove a sessão e expira o cookie; verificado com sessão sintética.
- [x] Reutilizar o cookie revogado retornou 401.
- [x] Os arquivos de evidência foram saneados e não incluem valores de cookies, códigos de autorização ou tokens.
- [x] Local Storage e Session Storage vazios após login Google e GitHub, conforme capturas da janela privativa em 29/09/2026.
- [ ] Inspeção dos registros de execução do Cloudflare concluída, sem tokens, códigos ou segredos expostos.
- [ ] O estudante revisou e consegue explicar por que arquivos estáticos continuam públicos.
- [ ] Sessões administrativas encerradas, caso o computador seja compartilhado. Não foram encerradas automaticamente, pois o usuário continua trabalhando.

## Revisão e identificação

Nome fornecido pelo estudante: João Vitor Andreata.
A matrícula foi conservada no resumo local de identificação, fora desta pasta pública.
Não foi informada participação de outra pessoa.
Assinatura/aceite do estudante: **João Vitor Andreata — 29/09/2026**.

Nome inserido mediante autorização expressa do estudante nesta revisão. O aceite refere-se aos resultados documentados, incluindo os testes confirmados pelo próprio estudante, e às ressalvas apresentadas. Os itens desmarcados permanecem pendentes; esta assinatura não declara que foram executados. Assinatura textual, sem certificado digital.

As marcações representam apenas verificações documentadas. Itens pendentes não devem ser assinados como concluídos antes da execução.

Responsável pela rotação dos Client Secrets: pendente de confirmação pelo aluno.

- [ ] A equipe não instalou nem executou Node.js, npm, npx ou Wrangler. Há registro de execução de Node em revisões assistidas, incluindo verificação anterior e ferramentas auxiliares de documentos; esse item não pode ser declarado integralmente atendido. Nenhuma dependência Node foi adicionada ao projeto.
