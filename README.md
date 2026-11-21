# Sistema de Cadastro de Usuários
 
Projeto desenvolvido como parte do desafio técnico Full-Stack do processo seletivo DevPool 2027.
 
A aplicação permite cadastrar, consultar, editar e excluir usuários, utilizando uma API REST e persistência em banco de dados SQLite.
 
## Tecnologias utilizadas
 
### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Vite
### Backend
- Node.js
- Express
- SQLite (sql.js)
- bcryptjs
- cors
## Estrutura do projeto
 
```text
desafio-tecnico-fullstack/
├── backend/
│   ├── database.js
│   ├── routes.js
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```
 
### Função de cada arquivo
 
| Arquivo | Função |
|---|---|
| `backend/server.js` | Inicia o Express, habilita CORS e JSON, registra as rotas e trata erros em JSON |
| `backend/routes.js` | Rotas `/users`: validações, regras de negócio e hash de senha |
| `backend/database.js` | Camada de dados: abre o SQLite, cria a tabela e grava o arquivo |
| `frontend/index.html` | Estrutura da página (formulário e lista) |
| `frontend/script.js` | Lógica da tela: chama a API com `fetch` e atualiza a lista |
| `frontend/style.css` | Estilo da interface |
| `vite.config.js` | Servidor de desenvolvimento e proxy de `/users` para o backend |
 
## Funcionalidades
 
- Cadastro de usuários.
- Listagem de usuários.
- Consulta de usuário por ID.
- Edição de usuários.
- Exclusão de usuários, com confirmação na tela.
- Validação dos dados.
- Verificação de e-mail e login duplicados.
- Armazenamento seguro de senhas utilizando hash com bcrypt.
- Controle de usuários ativos e inativos.
- Feedback visual: carregamento, mensagem de sucesso e mensagem de erro.
## Regras de validação
 
- Nome obrigatório, com no mínimo 3 caracteres (sem contar espaços nas pontas).
- E-mail obrigatório, com formato válido e único (não diferencia maiúsculas de minúsculas).
- Login obrigatório, com no mínimo 3 caracteres e único.
- Senha obrigatória no cadastro, com no mínimo 8 caracteres.
- Usuários são criados ativos por padrão.
- Senhas e hashes nunca são retornados nas respostas da API.
- Dados inválidos retornam `400` com um JSON explicativo.
## Como executar o projeto
 
### Pré-requisitos
 
- Node.js
- npm
### 1. Instalar as dependências
 
Na pasta principal do projeto, execute:
 
```bash
npm install
```
 
### 2. Iniciar o backend
 
Em um terminal, na pasta principal do projeto, execute:
 
```bash
node backend/server.js
```
 
O backend será iniciado na porta 3001. O arquivo do banco (`backend/database.sqlite`) é criado automaticamente na primeira execução.
 
### 3. Iniciar o frontend
 
Em outro terminal, também na pasta principal, execute:
 
```bash
npm run dev
```
 
Abra o endereço apresentado pelo Vite no navegador.
 
Mantenha os dois servidores em execução enquanto utilizar a aplicação.
 
> O frontend chama `/users` e o Vite encaminha a requisição para `http://127.0.0.1:3001` (proxy configurado em `vite.config.js`). O backend também habilita CORS.
 
## Endpoints da API
 
A API utiliza o prefixo `/users`.
 
| Método | Endpoint | Descrição | Sucesso |
|---|---|---|---|
| POST | `/users` | Cadastrar usuário | 201 |
| GET | `/users` | Listar usuários | 200 |
| GET | `/users/:id` | Consultar usuário por ID | 200 |
| PATCH | `/users/:id` | Atualizar usuário (campos parciais) | 200 |
| DELETE | `/users/:id` | Excluir usuário | 200 |
 
### Campos do usuário
 
| Campo | Tipo | Observação |
|---|---|---|
| `id` | inteiro | Gerado pelo servidor (autoincremento) |
| `nome` | texto | Obrigatório, mínimo de 3 caracteres |
| `email` | texto | Obrigatório, válido e único |
| `login` | texto | Obrigatório, mínimo de 3 caracteres e único |
| `senha` | texto | Obrigatória no cadastro, mínimo de 8 caracteres (nunca retornada) |
| `ativo` | booleano | Opcional, padrão `true` |
 
### Exemplos de chamadas (cURL)
 
**Cadastrar usuário (201)**
 
```bash
curl -i -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Pedro Silva","email":"pedro@email.com","login":"pedro123","senha":"12345678","ativo":true}'
```
 
Resposta:
 
```json
{
  "id": 1,
  "nome": "Pedro Silva",
  "email": "pedro@email.com",
  "login": "pedro123",
  "ativo": true
}
```
 
**Listar usuários (200)**
 
```bash
curl -i http://localhost:3001/users
```
 
**Consultar usuário por ID (200)**
 
```bash
curl -i http://localhost:3001/users/1
```
 
**Atualizar usuário (200)**
 
```bash
curl -i -X PATCH http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Pedro Santos","ativo":false}'
```
 
**Excluir usuário (200)**
 
```bash
curl -i -X DELETE http://localhost:3001/users/1
```
 
**Exemplos de erro**
 
```bash
# 400 - e-mail inválido
curl -i -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"invalido","login":"maria1","senha":"12345678"}'
 
# 400 - senha curta
curl -i -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria@email.com","login":"maria1","senha":"123"}'
 
# 404 - usuário inexistente
curl -i http://localhost:3001/users/999
```
 
Todos os erros seguem o formato:
 
```json
{
  "erro": "Mensagem explicativa do problema"
}
```
 
## Banco de dados
 
O projeto utiliza SQLite por meio da biblioteca sql.js.
 
Os dados são armazenados localmente em `backend/database.sqlite`, o que permite a persistência entre execuções da aplicação. O arquivo está no `.gitignore`.
 
As senhas são armazenadas em formato hash utilizando bcryptjs (custo 10).
 
O frontend nunca acessa o banco diretamente: toda operação passa pela API REST.
 
## Tratamento de erros
 
A API utiliza códigos HTTP para indicar o resultado das operações:
 
| Código | Significado |
|---|---|
| 200 | Operação realizada com sucesso |
| 201 | Usuário cadastrado |
| 400 | Dados inválidos, JSON malformado ou e-mail/login duplicado |
| 404 | Usuário ou rota não encontrados |
| 500 | Erro interno do servidor |
 
## Exclusão de usuários
 
A exclusão dos registros é **física**, ou seja, o usuário é removido definitivamente do banco de dados.
 
**Justificativa da escolha:**
 
- O escopo do sistema é um cadastro simples, sem histórico, auditoria ou outras tabelas que dependam do usuário.
- E-mail e login são únicos. Com exclusão lógica, um usuário "apagado" continuaria ocupando esses valores e impediria um novo cadastro com os mesmos dados.
- O campo `ativo` já cobre o caso de desativar um usuário sem removê-lo.
- Manter menos dados pessoais armazenados é mais simples e mais seguro.
**Limitação conhecida:** a exclusão física não permite recuperar um usuário removido por engano. Em um sistema com relacionamentos, histórico ou necessidade de auditoria, a opção mais adequada seria a exclusão lógica (por exemplo, com um campo `deleted_at`).
 
