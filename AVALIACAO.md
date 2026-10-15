# Avaliação — GitHub Actions com IA

**Aluno:** João Vitor Andreata — RA 2026107880  
**Dupla:** preencher o nome do segundo integrante.  
**Repositório:** https://github.com/jvcreator-br/site-autentica-o-frank  
**PR de preparação:** https://github.com/jvcreator-br/site-autentica-o-frank/pull/1

> Registro parcial. A Tarefa 1 foi executada; as outras tarefas ainda dependem das configurações e dos testes descritos abaixo. Este arquivo não deve ser entregue como avaliação concluída.

## Tarefa 1 — CI

O workflow `.github/workflows/ci.yml` roda em todo push e em pull requests para main. Verifica possíveis segredos nos arquivos de texto versionados, aplica cada migração em SQLite com interrupção no primeiro erro e valida os arquivos HTML com HTMLHint.

- [Execução verde do push](https://github.com/jvcreator-br/site-autentica-o-frank/actions/runs/38820210160).
- [Execução verde do PR](https://github.com/jvcreator-br/site-autentica-o-frank/actions/runs/38820233455).
- [Execução vermelha do PR com erro proposital](https://github.com/jvcreator-br/site-autentica-o-frank/actions/runs/38820267279).
- Commit com erro: `1137dbaf660a021b177470e1a183e9614f991f3d`.
- Commit que remove o erro: `54b299038179f64202f43d5a2296fd00eeed1a08`.

Trecho real do log da execução vermelha:

```text
Aplicando migrations/9999_teste_falha.sql
Parse error near line 2: near ";": syntax error
  CREATE TABLE ;
               ^--- error here
Process completed with exit code 1.
```

A migração é testada primeiro no SQLite para detectar erros SQL antes de alterar o banco D1 remoto, que usa SQLite como base.

O detector mostra somente nomes de arquivos para não publicar um segredo no log. O próprio ci.yml é excluído da busca porque contém a expressão de detecção; arquivos Markdown são excluídos conforme o exemplo do enunciado. Essa busca é uma verificação limitada dos arquivos atuais, não uma auditoria completa de todos os formatos e de todo o histórico.

## Tarefa 2 — Proteção da main

**Pendente:** configurar a regra da main com exigência de PR e check `verificar`, incluindo aplicação da regra a administradores. A main estava sem proteção na conferência inicial.

O PR da Tarefa 1 demonstra o CI reprovado, mas não comprova bloqueio por proteção da main. Depois de ativar a regra, é preciso repetir a falha e a correção, registrar o PR bloqueado e liberado e acrescentar a saída real de um `git push` recusado.

## Tarefa 3 — Revisão por IA

O workflow `.github/workflows/revisao-ia.yml` já foi criado com os eventos opened e synchronize, permissões contents: read e pull-requests: write, Copilot CLI, actions/ai-inference e publicação por `gh pr comment`.

[Execução inicial](https://github.com/jvcreator-br/site-autentica-o-frank/actions/runs/38820233382): parou na conferência da credencial, pois COPILOT_PAT ainda não está disponível. Esse erro **não substitui** o teste de ausência de pull-requests: write exigido na avaliação.

Pendências:

- Cadastrar COPILOT_PAT e comprovar a revisão de uma consulta SQL vulnerável em PR.
- Corrigir a consulta com placeholders e `.bind(nome)` na mesma branch e obter o segundo comentário.
- Remover temporariamente pull-requests: write, registrar o erro de permissão e restaurar.
- Citar uma afirmação realmente errada ou irrelevante da IA e explicar o motivo. Ainda não há resposta da IA para analisar; não foi inventada uma observação.

## Tarefa 4 — Migrações depois do merge

O workflow `.github/workflows/migrar.yml` usa push na main e o filtro `migrations/**`. Gera uma configuração Wrangler separada com o binding DB, aplica as migrações remotas e executa `PRAGMA table_info(notas)`.

**Pendente:** cadastrar os secrets Cloudflare e as variáveis com o banco real, completar o wrangler.toml a partir do modelo, mesclar os workflows e abrir um novo PR com `0002_adiciona_coluna.sql`. A migração inicial usa IF NOT EXISTS para preservar as tabelas de autenticação existentes; ela não substitui uma conferência do esquema remoto.

Ainda faltam o link da execução remota, a coluna nova na saída do PRAGMA e a evidência de um segundo merge sem alteração de migrations/ que não dispare migrar. O bônus ainda não foi implementado.

## Perguntas

### 1. Por que o CI roda duas vezes e qual execução é considerada?

O push na branch dispara o evento push e também atualiza o PR aberto, disparando pull_request. A execução do PR testa a integração com a main; quando há checks no commit de merge de teste, são eles que precisam passar para liberar o merge, conforme a regra configurada.

### 2. Por que um PR de fork não recebe COPILOT_PAT?

O código de um fork pode ter sido alterado por alguém sem confiança para acessar os segredos do repositório principal. Bloquear esses segredos impede que um workflow malicioso os copie e envie a terceiros.

### 3. Por que declarar permissions?

O workflow precisa ler o repositório e escrever um comentário no PR, por isso declara contents: read e pull-requests: write. Isso limita o GITHUB_TOKEN ao necessário e evita depender das permissões padrão, que podem variar entre repositórios.

### 4. A IA pode substituir o status check?

Não, porque a IA pode interpretar o código errado ou apontar um problema irrelevante, enquanto o CI executa verificações definidas de SQL e HTML. Ainda falta complementar esta resposta com a afirmação real observada no teste da Tarefa 3; até agora a IA não executou por falta de COPILOT_PAT.

## Referências

- https://github.com/actions/ai-inference
- https://developers.cloudflare.com/d1/reference/migrations/
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
