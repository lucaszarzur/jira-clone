# TaskFlow - Jira Clone com Backend MySQL e REST API

Este projeto é um clone do Jira implementado com Angular, Akita e ng-zorro no frontend e Java (Spring Boot) e MySQL no backend.

## Sobre o Projeto

Este projeto é um fork de [https://github.com/trungvose/jira-clone-angular](https://github.com/trungvose/jira-clone-angular), com melhorias significativas:

- Adição de um backend completo com Java (Spring Boot) e MySQL (o projeto original usava apenas armazenamento em memória)
- Implementação de uma API REST com persistência de dados
- Suporte para imagens em descrições e comentários
- Armazenamento de imagens em pasta no servidor
- Configuração com Docker para facilitar a implantação
- Correção de bugs e melhorias de desempenho

## Tecnologias Utilizadas

### Frontend

- Angular 13+
- Akita para gerenciamento de estado
- TailwindCSS para estilização
- ng-zorro para componentes de UI
- RxJS para programação reativa

### Backend

- Java (Spring Boot)
- MySQL
- Hibernate/JPA
- Docker

# Funcionalidades

## Autenticação e Segurança
- Sistema de autenticação JWT real com Spring Security
- Login modal com usuários demo
- Gerenciamento de tokens com refresh automático
- Proteção de rotas e endpoints
- Dois níveis de permissões (Sistema e Projeto)

## Gerenciamento de Projetos
- Visualização de projetos públicos e privados
- Criação de novos projetos
- Edição de informações do projeto
- Controle de visibilidade (público/privado)
- Gerenciamento de membros do projeto:
  - Adicionar membros
  - Remover membros
  - Alterar permissões (Admin/Membro/Visualizador)

## Gerenciamento de Issues
- Criação, edição e exclusão de issues
- Drag & Drop para alterar status (Backlog, Selected, In Progress, Done)
- Atribuição de múltiplos usuários (assignees)
- Alteração de tipo (Story, Task, Bug)
- Alteração de prioridade (Lowest, Low, Medium, High, Highest)
- Filtros por usuário, texto e status
- Auto-refresh para sincronização em tempo real (múltiplas abas)

## Comentários e Colaboração
- Adição de comentários às issues
- Edição de comentários próprios
- Suporte a imagens em comentários
- Identificação do usuário logado

## Persistência e Performance
- Persistência de dados em banco MySQL
- Cache de estado com Akita
- Sincronização automática entre abas
- Otimizações de performance

## Demonstração
Confira o **live demo** -> https://jira.lucaszarzur.dev

![TaskFlow - Jira clone built with Angular and Akita][demo]


![TaskFlow - Jira clone built with Angular and Akita][demo2]


## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Aplicação Angular que fornece a interface do usuário
- **Backend**: API REST com Java (Spring Boot) e MySQL para persistência de dados

## Estrutura do Banco de Dados

O banco de dados MySQL contém as seguintes tabelas:

- `users` - Usuários do sistema
- `projects` - Projetos
- `issues` - Issues/tarefas
- `comments` - Comentários nas issues
- `issue_users` - Relação entre issues e usuários (assignees)
- `permissions` - Permissões de usuários em projetos (Admin/Membro/Visualizador)
- `project_users` - Relação entre projetos e usuários


## Requisitos

- Docker
- Docker Compose
- Node.js (para desenvolvimento do frontend)
- Angular CLI (para desenvolvimento do frontend)
- Java 21+ e Maven (para desenvolvimento do backend)

## Configuração e Execução

### Ambientes Docker

O projeto possui configurações Docker para diferentes ambientes:

#### Ambiente de Desenvolvimento

Utiliza o servidor de desenvolvimento do Angular com hot-reload:

```bash
./build-deploy.sh dev
```

Ou manualmente:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### Ambiente de Produção

Compila o frontend Angular e serve os arquivos estáticos no container do frontend:

```bash
./build-deploy.sh prod
```

Ou manualmente:

```bash
docker-compose up -d
```

#### Limpeza do Ambiente Docker

Para remover contêineres, imagens e volumes:

```bash
./build-deploy.sh clean
```

### Diferenças entre Ambientes

| Característica | Desenvolvimento | Produção |
|----------------|-----------------|----------|
| Servidor Angular | `ng serve` com hot-reload | Arquivos estáticos via `serve` |
| Otimizações | Não otimizado, com sourcemaps | Código minificado, AOT |
| Volumes | Sincroniza arquivos locais | Sem volumes, build selada |
| Performance | Mais lento, para desenvolvimento | Rápido, otimizado |

### Configuração com Nginx

#### Ambiente Local (Desenvolvimento)
No ambiente de desenvolvimento local, o Nginx é incluído no container Docker do frontend para facilitar o desenvolvimento e testes.

#### Ambiente de Produção (VPS)
Em produção, recomenda-se usar o Nginx instalado diretamente na máquina host (VPS) como proxy reverso para os containers Docker. Isso evita conflitos de porta e permite uma configuração mais flexível.

Para isso:
1. Use o Dockerfile.prod para o frontend em produção: `docker-compose -f docker-compose.prod.yml up -d`
2. Configure o Nginx da máquina host usando o arquivo `nginx-host-config.conf` como modelo

O frontend possui três Dockerfiles diferentes:
- `Dockerfile` - Padrão para desenvolvimento local (inclui Nginx)
- `Dockerfile.dev` - Para desenvolvimento com hot-reload
- `Dockerfile.prod` - Para produção (sem Nginx, usa serve)

Para detalhes completos sobre a implantação, consulte [DEPLOYMENT.md](./DEPLOYMENT.md).

### Usando Docker (Recomendado)

1. Clone o repositório:

```bash
git clone https://github.com/lucaszarzur/jira-clone.git
cd jira-clone
```

2. Inicie os containers Docker:

```bash
docker-compose up -d
```

Isso iniciará:
- MySQL (porta 3306)
- Backend Java (porta 3001)
- Frontend Angular (porta 4200)

3. Acesse o frontend em:

```
http://localhost:4200
```

4. Acesse a API em:

```
http://localhost:3001/api
```

### Desenvolvimento Local (Sem Docker)

#### Backend

1. Configure um servidor MySQL local
2. Exporte as variáveis de ambiente necessárias (DB_*, JWT_SECRET, SEED_DATA, CORS_ORIGINS)
3. Execute:

```bash
cd backend-java
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

Obs.: se estiver rodando o frontend fora do Docker, ajuste o `frontend/proxy.conf.json` para apontar para `http://localhost:3000`.

### Desenvolvimento com Docker

Para desenvolvimento com hot-reload, você pode usar o docker-compose.dev.yml:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Este modo de desenvolvimento oferece:
- Hot-reload para o frontend (mudanças em arquivos são refletidas automaticamente)
- Hot-reload para o backend
- Container MySQL com persistência de dados

#


## Documentação

### API

Para mais detalhes sobre os endpoints da API, consulte o código do backend em `backend-java`.

### Gerenciamento de Imagens

O sistema inclui funcionalidades para gerenciamento de imagens:

- **Backend**: Processa imagens em base64, salva-as como arquivos e substitui por URLs.
- **Frontend**: Permite upload e redimensionamento de imagens no editor Quill. Veja [README-IMAGES.md](./frontend/README-IMAGES.md).

## Autor

- **Lucas Zarzur** - [Website](https://lucaszarzur.dev/) | [LinkedIn](https://www.linkedin.com/in/lucas-zarzur/) | [GitHub](https://github.com/lucaszarzur)
- **Produto**: [MeuNutria - Plataforma para Nutricionistas](https://meunutria.com/)

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT.


[demo]: frontend/src/assets/img/usage-example.gif
[demo2]: frontend/src/assets/img/usage-example-2.gif
