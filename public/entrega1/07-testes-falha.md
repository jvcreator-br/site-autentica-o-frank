# Testes de falha

Conferência: 30/09/2026, em produção, https://site-autentica-o-frank.pages.dev.

Os resultados abaixo foram executados nesta revisão. Cookies, códigos reais, tokens, state, nonce, code_verifier e identificadores privados não foram incluídos. O cliente HTTP usou User-Agent aceito pela Cloudflare e não seguiu redirecionamentos. Um bloqueio inicial na borda com o cliente padrão foi separado dos resultados da aplicação.

## Testes de falha executados

| Caso | Preparação e pedido | Resultado observado |
| --- | --- | --- |
| Callback sem cookie temporário | Iniciar login Google e GitHub; enviar callback sem cookie, com código sintético inválido | 400 nos dois provedores; no-store |
| State alterado | Usar o cookie de uma transação real iniciada em cada provedor; alterar o primeiro caractere de state e enviar código sintético | 400 nos dois provedores; /api/me com apenas o cookie temporário respondeu 401 |
| Consumo e reutilização da transação | Inserir transação sintética GitHub válida no D1; enviar callback com cookie e state correspondentes e código inválido; repetir o mesmo pedido e cookie | Primeira tentativa 400 por token inválido; D1 confirmou zero linhas para a transação consumida; repetição 400, com log na etapa transaction |
| Transação expirada | Inserir transação sintética GitHub com expires_at no passado; enviar callback com cookie e state correspondentes | 400; no-store |
| Sessão expirada | Inserir somente o resumo de um cookie sintético no D1, com expires_at no passado; consultar /api/me com esse cookie | 401; no-store |
| Origin inválido no logout | Sessão sintética válida; POST /oauth/logout com Origin https://example.com; consultar /api/me novamente | 403; a sessão permaneceu válida e /api/me respondeu 200 |
| Cookie revogado reutilizado | Mesma sessão sintética; POST com Origin exato do site; consultar /api/me reenviando o cookie antigo | Logout 303, cookie expirado com Max-Age=0; cookie antigo deu 401 |

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
