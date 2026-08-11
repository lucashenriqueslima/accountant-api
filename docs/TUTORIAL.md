# Manual do usuário — Forte Contabilidade

Guia prático de uso do sistema no dia a dia do escritório: o que é cada tela, o que cada
papel pode fazer e como executar a rotina diária.

- **Produção:** https://app.forte10.com.br

---

## 1. Como o sistema funciona (conceitos)

O sistema é um **kanban** desenhado para obrigações contábeis. Seis conceitos explicam tudo:

| Conceito             | O que é                                                             | Exemplo                                         |
| -------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| **Quadro (board)**   | Um painel, normalmente por departamento                             | "Departamento Fiscal", "Departamento Pessoal"   |
| **Coluna**           | Etapa do fluxo dentro do quadro                                     | A fazer → Em andamento → Em revisão → Concluído |
| **Tarefa (cartão)**  | A obrigação em si, com cliente, responsável, prazo e prioridade     | "Apuração do Simples — Padaria Pão Quente"      |
| **Cliente**          | Empresa/pessoa atendida pelo escritório                             | CNPJ/CPF, regime tributário, e-mail, documentos |
| **Tipo de tarefa**   | Título pré-salvo, para não digitar sempre a mesma coisa             | "Apuração de ICMS", "Folha de pagamento"        |
| **Modelo de tarefa** | Tarefa **recorrente**: o sistema cria o cartão sozinho todo mês/ano | "DAS mensal — Tech Store"                       |

A regra de ouro: **trabalho é movimento de cartão entre colunas**. Tudo o que acontece com um
cartão (criação, edição, atribuição, movimentação, exclusão) fica gravado no histórico.

---

## 2. Entrar no sistema

1. Acesse https://app.forte10.com.br
2. Informe **e-mail** e **senha** e clique em **Entrar**.
3. Você cai no painel; use o menu lateral (à esquerda no computador, no botão ☰ no celular).

### Esqueci minha senha

1. Na tela de login, clique em **Esqueci minha senha**.
2. Digite seu e-mail e clique em **Enviar link**. Por segurança, a mensagem de confirmação é a
   mesma exista ou não a conta.
3. Abra o e-mail recebido e clique no link (**válido por 1 hora, e de uso único**).
4. Defina a nova senha (mínimo de **6 caracteres**) e confirme.

> Se o e-mail não chegar, fale com o administrador: o envio depende do servidor de e-mail
> configurado no servidor da API.

### Sair

No rodapé do menu lateral, ao lado do seu nome, clique no ícone de **sair** (⏻→).

---

## 3. Papéis e permissões

| Ação                                               | Administrador |            Gestor            |    Colaborador     |
| -------------------------------------------------- | :-----------: | :--------------------------: | :----------------: |
| Ver o **Meu board** (as próprias tarefas)          |      ✅       |              ✅              |         ✅         |
| Ver os quadros da equipe                           |      ✅       |              ✅              |         —          |
| Criar e editar tarefas                             |      ✅       |              ✅              |         —          |
| Atribuir responsável                               |      ✅       |              ✅              |         —          |
| Mover cartão de coluna                             |   qualquer    |           qualquer           | só os cartões dele |
| **Excluir** tarefa                                 |      ✅       |              —               |         —          |
| Comentar, anexar arquivo e enviar e-mail da tarefa |      ✅       |              ✅              |         ✅         |
| Clientes (cadastrar, editar, documentos)           |      ✅       |              ✅              |         —          |
| Modelos e tipos de tarefa                          |      ✅       | ✅ (não pode excluir modelo) |         —          |
| Usuários (criar, editar, papéis, excluir)          |      ✅       |     só visualizar ficha      |         —          |

O **Colaborador** enxerga apenas o **Meu board**: os cartões atribuídos a ele, que pode mover de
coluna, comentar, anexar arquivos e, ao concluir, usar para enviar o e-mail ao cliente. Ele não
cria, edita nem atribui tarefas — e não vê o trabalho dos colegas.

---

## 4. Tour da tela

- **Menu lateral** — Meu board, Boards da equipe, Tarefas, Clientes, Usuários (só aparece o que
  seu papel permite; **Meu board** aparece para todos).
- **Rodapé do menu** — seu nome, seu papel e o botão de sair.
- **No celular** — barra superior com o logo e o botão ☰; o menu abre como gaveta e fecha sozinho ao navegar.

> Ao entrar, cada papel cai direto na sua primeira tela: **Boards da equipe** para administrador
> e gestor, **Meu board** para o colaborador. Se você digitar o endereço de uma tela que seu papel
> não acessa, o sistema devolve você para a sua tela inicial.

---

## 5. A rotina do dia a dia

**De manhã (gestor):**

1. Abra **Boards da equipe** → escolha o quadro do departamento.
2. Veja o que o cron criou de madrugada na coluna **A fazer** (tarefas recorrentes, sem responsável).
3. Distribua: clique no ícone **👤+** de cada cartão e escolha o responsável.
4. Use o filtro **"Todos os responsáveis"** para conferir a carga de cada pessoa.

**Durante o dia (quem executa):**

5. Abra **Meu board** e arraste o cartão de **A fazer** → **Em andamento** conforme trabalha.
6. Registre o andamento no cartão: abra os detalhes (ícone 💬) e escreva um comentário,
   anexando os arquivos necessários.

**Ao concluir:**

7. Mova o cartão para **Concluído**.
8. Abra os detalhes → aba **E-mail** → escreva a mensagem, marque os anexos e envie ao cliente.

**No fim do mês:**

9. Em **Tarefas**, filtre por período de prazo para conferir o que ficou pendente.
10. Revise os **Modelos** para o mês seguinte (ative/desative/ajuste).

---

## 6. Os quadros (kanban)

São duas telas com o mesmo funcionamento — muda o que cada uma mostra.

### 📋 Meu board — as suas tarefas

Menu → **Meu board**. Disponível para **todos os papéis**. Traz somente os cartões atribuídos a
você, já separados nas colunas do quadro. Se as suas tarefas estão em mais de um departamento,
aparecem "pílulas" no topo para alternar entre os quadros.

Aqui você **executa**: arrasta o cartão entre as colunas, abre os detalhes para comentar e anexar
arquivos e, ao chegar em Concluído, envia o e-mail ao cliente. Não há criação nem atribuição de
tarefas nesta tela — o colaborador só mexe no que é dele (o sistema recusa a movimentação de
cartão de outra pessoa).

Sem tarefas atribuídas, a tela mostra "Você não tem tarefas atribuídas no momento".

### 🗂 Boards da equipe — a visão do gestor

Menu → **Boards da equipe** (administrador e gestor). Mostra **todos** os cartões do quadro, de
todas as pessoas. É a tela de distribuir e acompanhar o trabalho.

#### Escolher o quadro

As "pílulas" no topo listam os quadros (com o departamento ao lado). Clique para trocar.

#### Filtrar por responsável

O seletor **"Todos os responsáveis"** mostra o quadro só com os cartões de uma pessoa — é o
"board do fulano". Com um responsável selecionado, toda tarefa que você criar já nasce atribuída
a ele.

### Ler um cartão de relance

_(vale para as duas telas)_ Cada cartão mostra: título, selo de **prioridade**
(Baixa/Média/Alta/Urgente), etiquetas, cliente, prazo e a inicial do responsável.
**Prazo vencido aparece em vermelho** (enquanto a tarefa não estiver concluída).

### Mover um cartão

- **No computador:** arraste e solte. Uma linha azul mostra exatamente onde ele vai cair — dá
  para reordenar dentro da mesma coluna, não só trocar de coluna.
- **No celular:** toque no ícone **⇄** do cartão e escolha a coluna de destino (o cartão vai para
  o fim da coluna escolhida).

### Atribuir responsável

_(só em Boards da equipe)_ Clique em **👤+** no cartão → busque a pessoa pelo nome → clique nela.
Para tirar o responsável, use **Remover atribuição**. Fica registrado no histórico como "Atribuiu".

### Criar tarefa direto na coluna

_(só em Boards da equipe)_ No fim de cada coluna, clique em **+ Adicionar tarefa**. Abre um
formulário completo já posicionado naquele quadro/coluna:

- **Título** — digite livre ou escolha um **tipo de tarefa** salvo (o campo sugere enquanto você
  digita). O botão **+** ao lado abre o gerenciador de tipos.
- **Descrição**, **Quadro**, **Coluna**, **Cliente**, **Responsável**, **Prioridade**, **Prazo**.

### Abrir os detalhes

O ícone 💬 no cartão abre a janela de detalhes (comentários, anexos e e-mail) — veja a seguir.

---

## 7. Janela de detalhes da tarefa

Abre pelo ícone 💬 no cartão do quadro. O cabeçalho mostra o título e em qual lista (coluna) a
tarefa está. Três abas:

### 💬 Comentários

O diário da tarefa. Escreva no editor (com **negrito**, _itálico_, lista simples e numerada),
anexe arquivos pelo clipe 📎 e clique em **Comentar**. Cada comentário mostra autor, data/hora e
os arquivos anexados (clique para abrir). Você pode excluir **os seus** comentários; o
administrador pode excluir qualquer um.

### 📎 Anexos

Arquivos da tarefa como um todo (não de um comentário). **Adicionar** envia um arquivo de até
**20 MB**. A lista mostra tamanho, quem enviou e quando, com botões para abrir e excluir.
É daqui que saem os arquivos que você anexa ao e-mail do cliente.

### ✉️ E-mail

**Só libera quando a tarefa está na coluna "Concluído"** — antes disso aparece um aviso.
Essa regra vale também na API, então não há como burlar pela tela.

Ao compor:

- **Para** — já vem preenchido com o e-mail do cliente da tarefa; aceite vários endereços
  separados por vírgula, ponto e vírgula ou espaço.
- **Cc** (opcional), **Assunto** (já vem com o título da tarefa) e **Mensagem** (editor rich text).
- **Anexos da tarefa** — marque quais arquivos da aba Anexos devem seguir junto.
- **Enviar e-mail**.

Abaixo fica o histórico de envios: assunto, destinatários, data, quem enviou e o selo
**Enviado** ou **Falhou**. Clique na linha para expandir e ver o corpo da mensagem, o Cc, os
anexos e, se falhou, o motivo do erro.

---

## 8. Tarefas (visão em lista)

Menu → **Tarefas**. É a visão de planilha do que os quadros mostram como cartões — melhor para
buscar, conferir prazos e fazer edições em ficha.

### Buscar e filtrar

- **Campo de busca** — procura por título, descrição, nome/fantasia/documento do cliente, nome do
  responsável e nome da coluna. Busca enquanto você digita.
- **Prazo — de / até** — recorta por período de vencimento.
- **Limpar** — zera os filtros.
- **Ordenar** — clique nos cabeçalhos "Tarefa", "Prioridade" e "Prazo".

### Ações de cada linha

- 👁 **Ver** — abre a ficha com todos os dados **e o histórico completo de atividades**.
- ✏️ **Editar** — formulário completo da tarefa.
- 🗑 **Excluir** — **só administrador**. É _soft delete_: a tarefa some das telas mas fica no banco,
  com o registro de quem excluiu.

### Nova tarefa

Botão **Nova tarefa** (canto superior direito) → mesmo formulário do quadro. Ao salvar, você
volta para a lista.

### Tipos de tarefa (títulos pré-salvos)

No campo **Título** de qualquer formulário, o botão **+** abre **Tipos de tarefa**:
crie, renomeie e exclua títulos padrão do escritório. Eles passam a aparecer como sugestão para
todo mundo — evita "Apuração ICMS", "apuração de icms" e "APURAÇÃO DE ICMS" convivendo na base.
Títulos livres continuam permitidos.

---

## 9. Modelos de Tarefa (tarefas recorrentes)

O recurso que tira a obrigação mensal da cabeça de alguém. Menu → **Tarefas** → botão **Modelos**.

**Como funciona:** todo dia às **00:01 (horário de Brasília)** o sistema lê os modelos **ativos** e
cria, para cada um, um cartão na coluna **"A fazer"** do quadro escolhido — **sem responsável**,
para o gestor distribuir de manhã.

**Frequência:**

- **Mensal** — um cartão por mês. Se já existir um cartão daquele modelo no mês corrente, ele é pulado.
- **Anual** — um cartão por ano, mesma lógica.

Ou seja: pode rodar todo dia sem medo de duplicar.

### Criar um modelo

No formulário do topo da janela: **Título** (com sugestão de tipos), **Descrição**, **Quadro**
(obrigatório), **Cliente** (opcional), **Prioridade**, **Frequência** e a marcação **Ativo** →
**Adicionar modelo**.

### Gerenciar os modelos

Cada linha da lista traz frequência, prioridade e os botões:

- ⏻ **Ativar/Desativar** — modelo inativo aparece esmaecido e não gera nada (ideal para pausar uma
  obrigação sem perder o cadastro).
- ✏️ **Editar**
- 🗑 **Excluir** — **só administrador** (o gestor vê o botão, mas recebe erro de permissão).

### Gerar agora

O botão **Gerar agora**, no rodapé da janela, roda a rotina na hora — útil ao cadastrar um modelo
no meio do mês. O resultado aparece em texto: quantos cartões foram criados, quantos foram
pulados (já existiam no período) e quantos modelos ativos existem.

### Modelos por cliente

Em **Clientes → Editar**, o botão **Modelos de Tarefa** abre a mesma janela já filtrada por aquele
cliente, com o campo Cliente pré-preenchido. É o caminho natural ao dar entrada em um cliente
novo: cadastrou o cliente, já deixa as obrigações recorrentes dele armadas.

> ⚠️ O modelo só gera cartão se o quadro tiver uma coluna chamada **"A fazer"** (na falta dela, o
> sistema usa a primeira coluna do quadro).

---

## 10. Clientes

Menu → **Clientes**. Lista com nome/fantasia, CNPJ/CPF, regime, e-mail e status, com a mesma
barra de busca e filtro por período de cadastro.

### Cadastrar

**Novo cliente** → Razão social/Nome, Nome fantasia, **CNPJ/CPF** (não pode repetir), Regime
tributário (Simples Nacional, Lucro Presumido, Lucro Real, MEI), Telefone, E-mail e a marcação
**Cliente ativo** → **Salvar**.

Ao salvar um cliente novo, o sistema leva você direto para a tela de edição — porque é lá que se
anexam documentos.

> O **e-mail** cadastrado aqui é o que aparece preenchido no campo "Para" ao enviar o e-mail de
> uma tarefa concluída desse cliente. Vale a pena manter atualizado.

### Documentos do cliente

Na edição, seção **Documentos**: **Enviar arquivo** (até **20 MB** por arquivo). A lista mostra
tamanho, quem enviou e a data, com botões de abrir e excluir. Na tela de **visualização** do
cliente os documentos aparecem apenas para leitura/download.

Os arquivos vão para o **S3** (links temporários) quando o bucket está configurado; em
desenvolvimento, ficam em disco no servidor da API.

### Inativar

Desmarque **Cliente ativo** e salve. Ele continua na base (e no histórico das tarefas), sinalizado
como Inativo.

---

## 11. Usuários (somente administrador)

Menu → **Usuários**.

- **Novo usuário** — Nome, E-mail, Senha, **Papel** (Administrador / Gestor / Colaborador) e
  **Usuário ativo**.
- **Editar** — o campo Senha em branco **mantém a senha atual**; preenchido, troca. Aqui também se
  muda o papel de alguém.
- **Excluir** — remove o acesso (soft delete: o nome continua no histórico das tarefas).
- 👁 **Ver** — ficha do usuário. Essa tela específica o **Gestor** também acessa pela URL.

---

## 12. Histórico e auditoria

Em **Tarefas → 👁 Ver**, o painel **Histórico** lista, do mais recente ao mais antigo:

| Selo          | Quando aparece                                                                  |
| ------------- | ------------------------------------------------------------------------------- |
| **Criou**     | Tarefa criada (manualmente ou pelo cron — neste caso o autor é "Sistema")       |
| **Atualizou** | Diz quais campos mudaram: título, descrição, prioridade, prazo, coluna, cliente |
| **Moveu**     | Registra a coluna de destino                                                    |
| **Atribuiu**  | Nome do novo responsável, ou "Responsável removido"                             |
| **Excluiu**   | Exclusão (soft delete) pelo administrador                                       |

Cada linha mostra **quem** e **quando**. Comentários, anexos e e-mails enviados ficam registrados
na janela de detalhes do cartão, cada um com autor e data.

---

## 13. Perguntas frequentes e limitações atuais

**"Sou colaborador e o Meu board está vazio."**
Ninguém atribuiu tarefas a você ainda — ou as suas tarefas foram passadas para outra pessoa. Fale
com o gestor: é ele quem distribui os cartões pelo botão 👤+.

**"Só consigo mover os meus cartões."**
É a regra: o colaborador executa apenas o que está atribuído a ele. Administrador e gestor movem
qualquer cartão.

**"A aba E-mail está bloqueada."**
A tarefa precisa estar na coluna chamada exatamente **"Concluído"** (acentos e maiúsculas são
ignorados, mas o nome tem de ser esse). Se o seu quadro usa outro nome — "Finalizado", por exemplo —
o envio não libera.

**"O cron não criou o cartão do modelo."**
Verifique se o modelo está **Ativo**, se o quadro tem coluna **"A fazer"** e se já não existe um
cartão daquele modelo no período (mês, para mensal; ano, para anual). Em caso de dúvida, use
**Gerar agora** e leia o resumo.

**"Não consigo excluir uma tarefa/modelo."**
Exclusão de tarefa e de modelo é exclusiva do **Administrador**.

**"Como crio ou renomeio uma coluna? E as etiquetas coloridas?"**
Ainda não há tela para isso — quadros, colunas e etiquetas são criados pela API
(`/boards`, `/columns`) ou pelo seed. Peça ao administrador/desenvolvedor.

**"Mudei o nome do responsável / do cliente e o histórico ficou estranho?"**
Não: o histórico guarda o texto do momento em que a ação aconteceu. É proposital, é o registro
do que foi feito naquele dia.

---

## 14. Para o administrador — operação

- **Swagger da API:** `/docs` (produção: https://app.forte10.com.br/docs) — lista todos os
  endpoints, útil para criar quadros, colunas e etiquetas enquanto não há tela.
- **Ambiente local:**
  ```bash
  pnpm install && docker compose up -d && pnpm db:migrate && pnpm db:seed && pnpm dev
  ```
  App em http://localhost:5173, API em http://localhost:3333, e-mails de teste no MailHog em
  http://localhost:8025.
- **Recuperação de senha em produção** depende do servidor SMTP configurado no `.env` da API.
  Se os e-mails não estiverem chegando, confira essa configuração antes de investigar outra coisa.
- **Limite de upload:** 20 MB por arquivo, tanto em documentos de cliente quanto em anexos de tarefa.
