# Backend REST API para TaskFlow - Jira Clone

Este é o backend REST API para o projeto TaskFlow (Jira Clone), implementado com Node.js, Express, MySQL e Sequelize.

## Requisitos

- Docker
- Docker Compose

## Configuração e Execução

### Instalação Local (Sem Docker)

1. Clone o repositório:

```bash
git clone https://github.com/lucaszarzur/jira-clone.git
cd jira-clone/backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados MySQL localmente.

4. Configure as variáveis de ambiente no arquivo `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=jira_clone
NODE_ENV=development
```

5. Inicie o servidor:

```bash
npm run dev
```

### Usando Docker

Temos configurações Docker para diferentes ambientes:

#### Ambiente de Desenvolvimento

```bash
# Na raiz do projeto
docker-compose -f docker-compose.dev.yml up -d
```

Isso iniciará:
- Backend em modo de desenvolvimento com hot-reload (porta 3000)
- Frontend em modo de desenvolvimento (porta 4200)
- MySQL (porta 3306)

Os volumes estão configurados para permitir editar arquivos locais e ter as mudanças refletidas automaticamente.

#### Ambiente de Produção

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso iniciará:
- Backend em modo de produção (porta 3000)
- Frontend otimizado (porta 4200)
- MySQL (porta 3306)

#### Scripts Auxiliares

Para facilitar o gerenciamento:

```bash
# Iniciar ambiente de desenvolvimento
./build-deploy.sh dev

# Iniciar ambiente de produção
./build-deploy.sh prod

# Limpar ambiente Docker (remover contêineres, imagens e volumes)
./build-deploy.sh clean
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações do banco de dados e ambiente
│   ├── controllers/    # Controladores para manipulação de requisições
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middlewares Express
│   ├── utils/          # Utilitários
│   └── index.js        # Ponto de entrada da aplicação
├── .env                # Variáveis de ambiente
├── Dockerfile          # Configuração do Docker
└── package.json        # Dependências do projeto
```

## Endpoints da API

### Usuários

- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Obter um usuário pelo ID
- `POST /api/users` - Criar um novo usuário
- `PUT /api/users/:id` - Atualizar um usuário
- `DELETE /api/users/:id` - Excluir um usuário

### Projetos

- `GET /api/projects` - Listar todos os projetos
- `GET /api/projects/:id` - Obter um projeto pelo ID (com issues e usuários)
- `POST /api/projects` - Criar um novo projeto
- `PUT /api/projects/:id` - Atualizar um projeto
- `DELETE /api/projects/:id` - Excluir um projeto

### Issues

- `GET /api/issues` - Listar todas as issues
- `GET /api/issues/:id` - Obter uma issue pelo ID
- `POST /api/issues` - Criar uma nova issue
- `PUT /api/issues/:id` - Atualizar uma issue
- `DELETE /api/issues/:id` - Excluir uma issue

### Comentários

- `GET /api/comments` - Listar todos os comentários
- `GET /api/comments/issue/:issueId` - Listar comentários de uma issue
- `GET /api/comments/:id` - Obter um comentário pelo ID
- `POST /api/comments` - Criar um novo comentário
- `PUT /api/comments/:id` - Atualizar um comentário
- `DELETE /api/comments/:id` - Excluir um comentário

## Modelo de Dados

### Usuários (users)

- `id` - ID único do usuário
- `name` - Nome do usuário
- `email` - Email do usuário
- `avatarUrl` - URL da imagem de avatar
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Projetos (projects)

- `id` - ID único do projeto
- `name` - Nome do projeto
- `url` - URL do projeto
- `description` - Descrição do projeto
- `category` - Categoria (Software, Marketing, Business)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Issues (issues)

- `id` - ID único da issue
- `title` - Título da issue
- `type` - Tipo (Story, Task, Bug)
- `status` - Status (Backlog, Selected, InProgress, Done)
- `priority` - Prioridade (Lowest, Low, Medium, High, Highest)
- `listPosition` - Posição na lista
- `description` - Descrição da issue
- `estimate` - Estimativa de tempo
- `timeSpent` - Tempo gasto
- `timeRemaining` - Tempo restante
- `reporterId` - ID do usuário que reportou a issue
- `projectId` - ID do projeto
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Comentários (comments)

- `id` - ID único do comentário
- `body` - Conteúdo do comentário
- `issueId` - ID da issue relacionada
- `userId` - ID do usuário que criou o comentário
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Relação Issue-Usuário (issue_users)

- `issueId` - ID da issue
- `userId` - ID do usuário (assignee)

## Autor

- **Lucas Zarzur** - [Website](https://lucaszarzur.dev/) | [LinkedIn](https://www.linkedin.com/in/lucas-zarzur/) | [GitHub](https://github.com/lucaszarzur)
- **Produto**: [MeuNutria - Plataforma para Nutricionistas](https://meunutria.com/)
