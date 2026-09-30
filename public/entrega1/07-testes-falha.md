# Testes de falha

Conferência: 30/09/2026, em produção, https://site-autentica-o-frank.pages.dev.

Os resultados abaixo foram executados nesta revisão. Cookies, códigos reais, tokens, state, nonce, code_verifier e identificadores privados não foram incluídos. O cliente HTTP usou User-Agent aceito pela Cloudflare e não seguiu redirecionamentos. Um bloqueio inicial na borda com o cliente padrão foi separado dos resultados da aplicação.

## Testes de falha executados em 30/09/2026

| Caso | Preparação | Pedido enviado | Resultado esperado | Resultado observado |
| --- | --- | --- | --- | --- |
| 1. Retorno sem cookie temporário | Cliente sem cookie; login iniciado em cada provedor | Callback Google e GitHub com código sintético, sem cookie temporário | 400, sem sessão | 400 nos dois provedores; no-store |
| 2. State alterado | Transação real iniciada em cada provedor; cookie conservado temporariamente | Alterar um caractere de state e enviar callback com código sintético | 400 antes da troca, sem sessão | 400 nos dois provedores; /api/me somente com cookie temporário deu 401; a consulta atômica no código exige o resumo correto de state |
| 3. Transação reutilizada, teste complementar | Transação GitHub sintética válida no D1 | Callback com código inválido; repetir o mesmo pedido | Consumir na primeira tentativa e recusar repetição | Primeiro retorno 400 por token inválido; D1 confirmou zero linhas; repetição 400 na etapa transaction |
| 4. Sessão expirada | Sessão sintética com expires_at no passado | GET /api/me com o cookie correspondente | 401, no-store | 401, no-store |
| 5. Origin inválido na saída | Sessão sintética válida; /api/me inicialmente 200 | POST /oauth/logout com Origin https://example.com; GET /api/me depois | 403 e sessão preservada | 403; /api/me depois deu 200, no-store |
| 6. Cookie revogado reutilizado | Sessão sintética válida do caso 5 | POST de logout com Origin exato; GET /api/me reenviando cookie antigo | Logout bem-sucedido e cookie antigo recusado | 303; cookie expirado com Max-Age=0; cookie antigo deu 401, no-store |
| Adicional: transação expirada | Transação GitHub sintética com expires_at no passado | Callback com cookie e state correspondentes e código inválido | 400, sem sessão | 400, no-store |

Os dados sintéticos não representam contas reais. Cookies e state ficaram fora do repositório e das evidências. As sessões sintéticas foram removidas pelo logout; o D1 confirmou zero sessões de teste restantes. As duas transações sintéticas foram removidas ao terminar.

Limites: os testes HTTP de state e consumo usam códigos inválidos. Eles verificam a recusa e o consumo no D1, mas não são uma repetição de autorização real bem-sucedida. O teste de reutilização após login real continua respaldado apenas pela confirmação do aluno de 29/09/2026, registrada na versão anterior deste arquivo. Não foi apresentado como nova execução de 30/09.

## Outras respostas verificadas

| Pedido | Resultado observado |
| --- | --- |
| GET / por HTTPS | 200; dashboard carregado no navegador |
| GET /api/health | 200; JSON com status ok; no-store |
| GET /api/me sem sessão | 401; no-store |
| GET /oauth/login/invalid | 404; no-store |
| GET /oauth/callback/invalid | 404; no-store |
| GET /oauth/logout | 405; Allow: POST; no-store |
| POST /oauth/logout sem Origin | 403 |
| POST /oauth/logout com Origin do site seguido de barra | 403 |
| POST /oauth/logout com domínio parecido, terminado em .example.com | 403 |
| POST /oauth/logout sem sessão e com Origin exato | 303; retorno exato para a raiz; cookie expirado |
| GET /api/me com sessão sintética válida | 200; apenas issuer, subject, email e displayName; no-store |

## Início dos dois logins

As respostas /oauth/login/google e /oauth/login/github deram 302, com no-store, callback HTTPS exato, response_type code, state aleatório e PKCE S256. O desafio tem o formato esperado para SHA-256.

O cookie temporário usa __Host-oauth-tx, Path=/, Secure, HttpOnly, SameSite=Lax, Max-Age=600 e não tem Domain. Client Secret e code_verifier não aparecem no endereço de autorização.

Google pediu apenas openid email profile e incluiu nonce. GitHub não acrescentou scope nem nonce.

## Login real no navegador

- GitHub: autorização concluída em 30/09; o dashboard mostrou sessão autenticada por GitHub. A conta funcionou sem e-mail público. Sair da conta fez o painel voltar a Visitante e Sem sessão.
- Google: login concluído em 30/09; o dashboard mostrou sessão autenticada por Google. Sair da conta fez o painel voltar a Visitante e Sem sessão.
- A página usa /api/me e só renderiza o usuário quando recebe resposta bem-sucedida; o estado de visitante corresponde ao tratamento de 401. Nesta sequência de navegador não foi capturado separadamente o cabeçalho HTTP dos pedidos autenticados nem do POST de logout. Os códigos 200, 303 e 401 da sequência de sessão sintética foram medidos diretamente e estão acima.

Nenhum dado pessoal dos perfis foi transcrito.

## Logs e histórico

O stream de execução do deploy de produção foi aberto em 30/09. Nos callbacks de teste, as mensagens da aplicação mostraram somente OAuth callback failed, provedor, etapa e motivo genérico. Foram observadas as etapas transaction e identity, com o motivo github token. Não havia access token, ID token, Client Secret, código ou cookie nessas mensagens. O stream foi pausado após a conferência.

O evento técnico da plataforma contém a URL da requisição e outros metadados privados. Não foi copiado para a entrega. A conferência acima se refere às mensagens emitidas pelo código da aplicação, não a uma promessa de que toda a telemetria da plataforma omite URLs OAuth.

Os registros de 25 e 29/09 permanecem no histórico Git, incluindo o commit fb94be4. Eles registravam os dois logins, logout e armazenamento Web, além de confirmações do aluno sobre falhas. Não foram reclassificados como testes executados nesta revisão. A inspeção de Local Storage e Session Storage de 29/09 permanece histórica; o frontend atual não usa essas APIs para guardar tokens.

## Testes do roteiro no navegador - histórico de 29/09/2026

A confirmação abaixo já estava registrada no commit fb94be4. Foi preservada como relato do aluno, com sua data e seus limites; não foi transformada em nova execução de 30/09. O caso 1 também tinha captura do retorno recusado e /api/me 401; os demais limites permanecem explícitos.

## Consolidacao dos testes confirmados pelo aluno em 29/09/2026

O aluno informou que executou os testes e confirmou os resultados abaixo. Esta atualizacao substitui o status de pendente de execucao dos respectivos cenarios nos registros anteriores. Os detalhes e limites das capturas anteriores permanecem como historico. Nao foram fornecidas novas capturas ou registros tecnicos para esta confirmacao final.

| Caso | Preparacao do cenario | Pedido do cenario | Resultado esperado | Resultado observado, conforme confirmacao do aluno |
| --- | --- | --- | --- | --- |
| Retorno sem cookie temporario | Janela de retorno sem cookie temporario | Retorno OAuth apos autenticacao | Recusar, sem criar sessao | Retorno recusado, sem criar sessao; a sequencia anterior tambem possui captura da falha e /api/me 401 |
| State alterado | Transacao iniciada com alteracao de state | Retorno com state alterado | Recusar antes da troca do codigo, sem criar sessao | Aluno confirmou recusa e ausencia de sessao; a ordem interna de processamento nao foi observada diretamente |
| Transacao reutilizada | Login concluido e transacao consumida | Repetir callback | Recusar a segunda utilizacao | Segunda utilizacao recusada |
| Sessao expirada | Sessao de teste expirada | GET /api/me | HTTP 401 | HTTP 401 |
| Origem invalida na saida | Sessao valida e origem diferente da producao | POST /oauth/logout com origem invalida, seguido de consulta da sessao | HTTP 403 e sessao preservada | HTTP 403 e sessao preservada |
| Cookie revogado reutilizado | Logout realizado e cookie antigo restaurado | GET /api/me com cookie revogado | HTTP 401, sem restaurar sessao | HTTP 401, sem restaurar sessao |
| Transacao OAuth expirada | Transacao alem de sua validade | Retorno OAuth | Recusar, sem criar sessao | Retorno recusado, sem criar sessao |

A tabela descreve as condicoes dos cenarios e os resultados confirmados pelo aluno. Nao documenta horarios, duracoes, comandos ou capturas adicionais que nao foram fornecidos. A confirmacao nao abrange a inspecao dos registros de execucao do Cloudflare, o aceite final ou outras pendencias fora desses testes.
