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

## Funcionalidades

- Cadastro de usuários.
- Listagem de usuários.
- Consulta de usuário por ID.
- Edição de usuários.
- Exclusão de usuários.
- Validação dos dados.
- Verificação de e-mail e login duplicados.
- Armazenamento seguro de senhas utilizando hash com bcrypt.
- Controle de usuários ativos e inativos.

## Regras de validação

- Nome obrigatório, com no mínimo 3 caracteres.
- E-mail obrigatório, válido e único.
- Login obrigatório, com no mínimo 3 caracteres e único.
- Senha obrigatória no cadastro, com no mínimo 8 caracteres.
- Usuários são criados ativos por padrão.
- Senhas não são retornadas nas respostas da API.

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

Em um terminal, execute:

```bash
node backend/server.js
```

O backend será iniciado na porta 3001.

### 3. Iniciar o frontend

Em outro terminal, execute:

```bash
npm run dev
```

Abra o endereço apresentado pelo Vite no navegador.

Mantenha os dois servidores em execução enquanto utilizar a aplicação.

## Endpoints da API

A API utiliza o prefixo `/users`.

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/users` | Cadastrar usuário |
| GET | `/users` | Listar usuários |
| GET | `/users/:id` | Consultar usuário por ID |
| PATCH | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Excluir usuário |

### Exemplo de cadastro

**POST /users**

```json
{
  "nome": "Pedro Silva",
  "email": "pedro@email.com",
  "login": "pedro123",
  "senha": "12345678",
  "ativo": true
}
```

### Exemplo de atualização

**PATCH /users/1**

```json
{
  "nome": "Pedro Santos",
  "ativo": false
}
```

## Banco de dados

O projeto utiliza SQLite por meio da biblioteca sql.js.

Os dados são armazenados localmente em um arquivo de banco de dados, permitindo sua persistência entre execuções da aplicação.

As senhas são armazenadas em formato hash utilizando bcryptjs.

## Tratamento de erros

A API utiliza códigos HTTP para indicar o resultado das operações:

- 200 — Operação realizada com sucesso.
- 201 — Usuário cadastrado.
- 400 — Dados inválidos ou duplicados.
- 404 — Usuário não encontrado.
- 500 — Erro interno do servidor.

## Exclusão de usuários

A exclusão dos registros é física, ou seja, o usuário é removido do banco de dados.

