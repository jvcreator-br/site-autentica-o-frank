# Testes de falha — site-autentica-o-frank

Data: 25/09/2026. Ambiente: produção, https://site-autentica-o-frank.pages.dev.

Este registro distingue testes realizados de verificações ainda pendentes. Não contém cookies, códigos reais, tokens, state, nonce ou segredos. Os testes HTTP usaram um identificador de navegador aceito pela Cloudflare. Uma primeira tentativa com outro identificador foi bloqueada na borda e foi descartada como evidência da aplicação.

## 1. Retorno sem cookie temporário

- Preparação: cliente HTTP sem cookies.
- Pedido enviado: GET /oauth/callback/github com código e state sintéticos inválidos, sem o cookie temporário.
- Resultado esperado: rejeição, sem criação de sessão.
- Resultado observado: HTTP 400, Cache-Control: no-store. O código da rota recusa a ausência do cookie antes de consultar o banco ou trocar o código.
- Limite: teste direto da condição de ausência do cookie. A sequência completa do enunciado, concluindo a autorização em janela privativa, ainda não foi reproduzida.

## 2. State alterado

- Preparação: iniciar uma transação real em /oauth/login/google e outra em /oauth/login/github; conservar o respectivo cookie somente em memória.
- Pedido enviado: callback de cada provedor, mantendo o cookie da transação e alterando o primeiro caractere de state; código de autorização sintético inválido.
- Resultado esperado: HTTP 400, sem criar sessão.
- Resultado observado: HTTP 400 nos dois provedores, Cache-Control: no-store.
- Limite: o código de autorização foi sintético. A consulta DELETE ... RETURNING exige correspondência do resumo de state antes de permitir a troca do código. A repetição com autorização real alterada no navegador permanece pendente.

## 3. Reutilização da transação após login bem-sucedido

- Preparação: os logins reais de Google e GitHub foram concluídos com sucesso no navegador.
- Pedido a enviar: repetir exatamente o callback de um login já concluído, conservando a URL apenas temporariamente no painel Network.
- Resultado esperado: HTTP 400, sem nova sessão, pois a transação já foi consumida.
- Resultado observado: **pendente de execução**. A interface de automação não disponibilizou o callback intermediário no histórico; não foi possível reproduzir a requisição real.
- Inspeção complementar: a implementação usa DELETE ... RETURNING com provider, resumo do cookie, resumo de state e expiração, antes da troca do código. Esta inspeção não substitui o teste.

## 4. Sessão expirada

- Preparação: concluir login real com Google e confirmar a mensagem de sessão na página.
- Pedido enviado: atualizar expires_at para 0 apenas na sessão Google mais recente no console D1; recarregar a página.
- Resultado esperado: a sessão deixar de ser reconhecida.
- Resultado observado: o D1 confirmou expires_at = 0; após recarregar, a página mostrou “Nenhuma sessão neste navegador.”
- Limite: o estado HTTP dessa consulta autenticada não foi capturado separadamente. A página consulta /api/me; o código retorna 401 para sessão expirada. A consulta HTTP independente sem sessão retornou 401.

## 5. Origem inválida na saída

- Preparação: sessão sintética temporária de teste, com 32 bytes aleatórios; somente o resumo SHA-256 foi inserido no D1. Nenhuma credencial de conta foi usada. /api/me respondeu 200.
- Pedido enviado: POST /oauth/logout com Origin: https://example.com e o cookie da sessão de teste.
- Resultado esperado: 403, mantendo a sessão válida.
- Resultado observado: 403; consulta subsequente a /api/me com o mesmo cookie respondeu 200. Todas as respostas usaram Cache-Control: no-store.
- Método: requisição HTTP direta, para testar a conferência de Origin sem depender de bloqueios CORS ou SameSite do navegador.

## 6. Reutilização do cookie revogado

- Preparação: a mesma sessão sintética válida do caso 5, cookie conservado somente em memória.
- Pedido enviado: POST /oauth/logout com Origin igual à URL de produção; depois GET /api/me reenviando exatamente o cookie anterior.
- Resultado esperado: saída bem-sucedida; cookie antigo rejeitado com 401.
- Resultado observado: logout 303, Set-Cookie com Max-Age=0; reutilização do cookie retornou 401. Cache-Control: no-store. O valor temporário foi descartado e a sessão removida pelo logout.

## Verificações adicionais

| Verificação | Resultado observado |
| --- | --- |
| Página inicial sem sessão | 200, conteúdo estático público |
| /api/health | 200 |
| /api/me sem cookie | 401, no-store |
| Provedor desconhecido no início do login | 404, no-store |
| Callback Google sem parâmetros | 400, no-store |
| Início Google e GitHub | 302, no-store, PKCE S256 e cookie temporário protegido |
| Login real GitHub | Página reconheceu sessão; funcionou sem e-mail público |
| Login real Google | Página reconheceu sessão |
| Saída real de ambos | Página voltou a indicar ausência de sessão |

## Correções realizadas

- Adicionado User-Agent às chamadas da API GitHub para consulta do perfil e revogação da autorização. Commit ba7c82f8546559e0d067b281b1a51ffcdb69d19b, publicado com sucesso. Login real GitHub passou após a correção.
- Alterada a rota de saída para recusar métodos diferentes de POST com 405, Allow: POST e no-store. Commit d229db1619a4350aa0a8ad8ac8f25df4a1d23c26. A resposta GET anterior era 200 por retorno à página estática. Revalidação HTTP desta correção ainda pendente neste registro.

## Pendências antes da entrega definitiva

Reproduzir os casos 1 e 2 exatamente no navegador, executar o caso 3, registrar diretamente o 401 da sessão expirada e validar a resposta 405 da saída. Não interpretar este documento como aprovação integral dos seis cenários do enunciado.

## Conferencia no navegador em 29/09/2026 - GitHub

Teste executado pelo aluno no navegador e conferido pelas capturas enviadas nesta revisao.

- Preparacao: concluir o login GitHub no site de producao e atualizar a pagina.
- Pedido enviado: GET /api/me com a sessao criada pelo login.
- Resultado esperado: HTTP 200 e perfil reconhecido no painel.
- Resultado observado: HTTP 200 OK, Cache-Control: no-store e painel autenticado pelo GitHub. O painel informou que o provedor nao forneceu e-mail.

### Saida da sessao GitHub

- Preparacao: a sessao GitHub acima estava autenticada.
- Pedido enviado: acionar Sair da conta no site e inspecionar a consulta GET /api/me apos o retorno.
- Resultado esperado: ausencia de sessao e HTTP 401 em /api/me.
- Resultado observado: HTTP 401 Unauthorized, Cache-Control: no-store e painel sem sessao. Captura com resposta datada de 29/09/2026, 23:07:30 UTC (20:07:30 em Brasilia).
- Limite: esta captura comprova a consulta apos a saida; nao registra o status da requisicao POST /oauth/logout. Nao houve restauracao do cookie antigo neste teste, portanto ele nao substitui o caso 6 de reutilizacao do cookie revogado.

### Login Google conferido em 29/09/2026

- Preparacao: aluno concluiu o login Google no site de producao e atualizou a pagina com o Network aberto.
- Pedido enviado: GET /api/me com a sessao criada pelo login Google.
- Resultado esperado: HTTP 200 e painel autenticado pelo Google.
- Resultado observado: HTTP 200 OK, Cache-Control: no-store, Content-Type: application/json e painel autenticado pelo Google. Resposta datada de 29/09/2026, 23:09:50 UTC (20:09:50 em Brasilia).
- Dados pessoais do perfil foram omitidos deste registro.
- Pendentes nesta sequencia: logout Google com 401 observado, inspecao de Local Storage e Session Storage e testes de falha obrigatorios. A captura nao comprova esses itens.

### Saida Google conferida em 29/09/2026

- Preparacao: sessao Google autenticada, com GET /api/me 200 observado na captura anterior.
- Pedido enviado: aluno acionou Sair da conta; inspecionou GET /api/me apos o retorno ao site.
- Resultado esperado: HTTP 401 e painel sem sessao.
- Resultado observado: HTTP 401 Unauthorized, Cache-Control: no-store e painel indicando ausencia de sessao. Resposta datada de 29/09/2026, 23:11:46 UTC (20:11:46 em Brasilia).
- Limite: o status do POST /oauth/logout nao aparece nesta captura. Este teste nao inclui restauracao do cookie antigo e nao substitui o caso 6.
- Atualizacao da pendencia anterior: logout Google com 401 agora observado. Inspecao de armazenamento Web e testes de falha obrigatorios continuam pendentes nesta revisao.

### Armazenamento Web apos login Google - 29/09/2026

- Preparacao: aluno abriu uma janela privativa do Opera, concluiu login Google e inspecionou o dominio de producao na aba Application.
- Verificacao realizada: Local Storage e Session Storage de https://site-autentica-o-frank.pages.dev.
- Resultado esperado: ausencia de tokens nesses armazenamentos.
- Resultado observado: ambas as tabelas vazias nas capturas fornecidas. A captura de Session Storage tambem mostra sessao Google autenticada no painel.
- Limite: a verificacao vale para o ambiente e o momento capturados. Na janela comum havia entradas cuja origem nao foi determinada; nao foi comprovado que pertenciam a uma extensao. Armazenamento apos login GitHub e registros do servidor ainda precisam de conferencia nesta revisao.
- Dados pessoais visiveis no painel nao foram transcritos neste registro.

### Armazenamento Web apos login GitHub - 29/09/2026

- Preparacao: aluno concluiu login GitHub na janela privativa do Opera e abriu Application para o dominio de producao.
- Verificacao realizada: Local Storage e Session Storage de https://site-autentica-o-frank.pages.dev.
- Resultado esperado: ausencia de tokens nesses armazenamentos.
- Resultado observado: ambas as tabelas vazias nas duas capturas fornecidas, com sessao GitHub autenticada no painel. Capturas recebidas com horarios visiveis de 20:19 e 20:20 em 29/09/2026.
- Atualizacao: armazenamento Web conferido apos login Google e GitHub nesta revisao. A origem das entradas vistas anteriormente na janela comum continua indeterminada; nao se conclui que extensoes estavam desativadas na janela privativa.
- Limite: registros do servidor e testes de falha obrigatorios permanecem pendentes. Dados pessoais do painel nao foram transcritos.

### Caso 1 no navegador - retorno sem cookie temporario - 29/09/2026

- Preparacao: conforme a sequencia orientada ao aluno, iniciar login Google na janela normal e copiar o Location da resposta de /oauth/login/google para uma nova janela privativa, apos fechar as anteriores. Nao iniciar o fluxo pelo site na janela privativa.
- Pedido enviado: concluir a autenticacao Google na janela privativa e retornar a /oauth/callback/google. Parametros temporarios omitidos.
- Resultado esperado: recusa do retorno e ausencia de nova sessao.
- Resultado observado: captura fornecida pelo aluno mostra a janela privativa na rota /oauth/callback/google do site de producao e a mensagem Falha na autenticacao, em 29/09/2026, aproximadamente 20:27.
- Limite: o status HTTP do callback e a ausencia de sessao apos essa tentativa ainda nao foram conferidos diretamente nesta sequencia. Nao atribuir um status HTTP apenas pela mensagem exibida.
- A tentativa anterior interrompida na pagina do Google nao foi usada como evidencia de recusa pela aplicacao.

### Caso 1 - confirmacao de ausencia de sessao

- Continuacao do teste de retorno Google sem cookie temporario em 29/09/2026.
- Preparacao: apos a mensagem Falha na autenticacao, abrir a pagina inicial na mesma janela privativa sem iniciar outro login.
- Pedido enviado: GET /api/me pelo site, inspecionado no Network.
- Resultado esperado: HTTP 401 e painel sem sessao.
- Resultado observado: HTTP 401 Unauthorized, Cache-Control: no-store e painel sem sessao. Resposta datada de 29/09/2026, 23:29:35 UTC (20:29:35 em Brasilia).
- Conclusao: a sequencia orientada no navegador apresentou recusa do retorno e ausencia de sessao reconhecida posteriormente. A pendencia de conferir ausencia de sessao do registro anterior foi resolvida. O status HTTP do callback nao foi capturado e permanece nao informado.

### Caso 2 no navegador - state alterado - 29/09/2026

- Preparacao: aluno iniciou login Google e parou na escolha de conta; copiou o Location da resposta inicial e recebeu orientacao para alterar apenas o primeiro caractere de state, abrindo o endereco alterado na mesma aba.
- Pedido enviado: concluir o login Google a partir da URL de autorizacao com state alterado. Valores temporarios e URL completa nao registrados.
- Resultado esperado: retorno recusado antes da troca do codigo.
- Resultado observado: aluno informou no chat que apareceu falha apos concluir o fluxo alterado.
- Limites: resultado relatado pelo aluno, sem captura desta falha ou status HTTP do callback nesta etapa. Ainda falta conferir /api/me apos a tentativa. O tempo decorrido e a ausencia de troca do codigo no servidor nao foram verificados diretamente; nao declarar isolamento completo da causa apenas pela mensagem generica.

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
