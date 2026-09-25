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
