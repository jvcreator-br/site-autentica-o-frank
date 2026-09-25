# Lista de aceitação — site-autentica-o-frank

Responsável: João Vitor Andreata.
Data da verificação: 25/09/2026.
Status: revisão final pendente; não constitui declaração de conclusão integral.

- [x] O site é servido por https://site-autentica-o-frank.pages.dev.
- [x] Arquivos estáticos e Functions usam a mesma origem.
- [x] Publicação por integração com GitHub, branch main, saída public, comando de construção vazio.
- [ ] Dashboard da disciplina incluído em public. O repositório atual contém apenas a página mínima de login; é necessário confirmar e obter o dashboard original.
- [x] O projeto não contém package.json, package-lock.json, node_modules ou wrangler.jsonc; as Functions usam APIs Web sem bibliotecas externas.
- [x] Cada provedor usa URL de retorno própria e exata.
- [x] Os pedidos de autorização usam código e PKCE S256, verificados nas respostas 302.
- [x] Os dois Client Secrets estão criptografados no painel Pages. Não foram copiados para os arquivos de evidência.
- [x] O código envia o Client Secret à troca de tokens. No GitHub, também o utiliza na autenticação Basic da revogação exigida pelo roteiro.
- [ ] Todos os testes de transação ausente, expirada, alterada e reutilizada estão concluídos. Consultar limites e pendências em 07-testes-falha.md.
- [x] O código valida assinatura RS256, emissor, audiência, expiração, instante de emissão e nonce do Google antes de criar sessão; login real concluído.
- [x] O código usa o token GitHub em /user e exige revogação da autorização com resposta 204 antes de criar sessão; login real concluído após a correção de User-Agent.
- [x] O cookie de sessão definido no código é opaco, Secure, HttpOnly, SameSite=Strict e não possui Domain.
- [x] O D1 guarda o resumo do cookie. A sessão sintética também foi inserida somente pelo resumo.
- [x] /api/me devolve issuer, subject, email e displayName, com no-store; autenticação confirmada pela página e por teste HTTP de sessão sintética.
- [x] O logout confere Origin, remove a sessão e expira o cookie; verificado com sessão sintética.
- [x] Reutilizar o cookie revogado retornou 401.
- [x] Os arquivos de evidência foram saneados e não incluem valores de cookies, códigos de autorização ou tokens.
- [ ] Inspeção final do armazenamento local, armazenamento de sessão e registros em execução concluída. O código revisado não grava tokens no armazenamento Web; falta a conferência direta no navegador.
- [ ] O estudante revisou e consegue explicar por que arquivos estáticos continuam públicos.
- [ ] Sessões administrativas encerradas, caso o computador seja compartilhado. Não foram encerradas automaticamente, pois o usuário continua trabalhando.

## Revisão e identificação

Nome fornecido pelo estudante: João Vitor Andreata.
A matrícula foi conservada no resumo local de identificação, fora desta pasta pública.
Não foi informada participação de outra pessoa.
Assinatura/aceite final do estudante: **pendente de revisão**.

As marcações representam apenas verificações documentadas. Itens pendentes não devem ser assinados como concluídos antes da execução.
