# Instruções de Implantação

Este documento descreve como implantar a aplicação Jira Clone em um ambiente de produção utilizando Docker para backend e frontend, e o Nginx diretamente na máquina host como proxy reverso.

## Pré-requisitos

- Docker e Docker Compose instalados na máquina host
- Nginx instalado diretamente na máquina host
- Git para clonar o repositório

## Ambientes de Implantação

O projeto conta com duas configurações principais:

### Ambiente de Desenvolvimento

Ideal para desenvolvimento e testes, com recursos de hot-reload.

```bash
./build-deploy.sh dev
```

Características:
- Frontend: Servidor de desenvolvimento do Angular com hot-reload
- Backend: Modo de desenvolvimento com hot-reload
- Volumes mapeados para permitir edição de arquivos locais

### Ambiente de Produção

Otimizado para performance e segurança.

```bash
./build-deploy.sh prod
```

Características:
- Frontend: Aplicação Angular compilada e otimizada, servida pelo container de frontend
- Backend: Modo de produção otimizado
- Sem volumes para garantir que apenas a versão compilada seja utilizada
 

## Docker vs. Instalação Direta

### Vantagens do Docker

- **Isolamento**: Cada componente roda em seu próprio ambiente isolado
- **Consistência**: Mesmo ambiente em desenvolvimento e produção
- **Facilidade**: Não é necessário instalar dependências localmente
- **Portabilidade**: Fácil de migrar entre servidores

### Quando Usar Instalação Direta

Em alguns casos específicos, pode ser preferível instalar diretamente:
- Servidores com recursos muito limitados
- Necessidades específicas de otimização
- Integração com sistemas existentes que não usam Docker

## Passos para Implantação

### 1. Clonar o Repositório

```bash
git clone https://seu-repositorio/jira-clone.git
cd jira-clone
```

### 2. Configurar o Nginx na Máquina Host

O arquivo `jira-clone-nginx-host-config.conf` é um template para o proxy reverso do Nginx na máquina host.

Copie o template e edite com os dados do seu domínio:

```bash
sudo cp jira-clone-nginx-host-config.conf /etc/nginx/sites-available/seu-dominio.conf
sudo nano /etc/nginx/sites-available/seu-dominio.conf
```

No arquivo, substitua:
- `seu-dominio.com` pelo seu domínio real
- Os caminhos de log conforme necessário

Habilite o site e recarregue o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/seu-dominio.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Configurar SSL com Certbot (Recomendado)

Para habilitar HTTPS com certificado gratuito do Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

O Certbot modifica automaticamente a configuração do Nginx para incluir o certificado SSL e o redirect HTTP → HTTPS.

### 4. Iniciar os Contêineres Docker

Para iniciar em modo de produção:

```bash
./build-deploy.sh prod
```

### 5. Verificar a Implantação

A aplicação deve estar acessível através do seu domínio. Você pode verificar os logs dos contêineres para solucionar problemas:

```bash
# Ver logs do backend
docker logs jira-clone-backend

# Ver logs do frontend
docker logs jira-clone-frontend
```

## Solução de Problemas

### Problemas com o Frontend

Se o frontend não estiver carregando corretamente, você pode reconstruí-lo usando:

```bash
cd frontend
./rebuild.sh
```

### Problemas de Conexão com o Backend

Verifique se as portas estão corretamente mapeadas no docker-compose.yml e na configuração do Nginx.

### Limpar o Ambiente Docker

Para limpar todos os contêineres, imagens e volumes:

```bash
./build-deploy.sh clean
```

## Atualização da Aplicação

Para atualizar a aplicação após alterações no código:

1. Pare os contêineres:
```bash
docker-compose down
```

2. Atualize o código:
```bash
git pull
```

3. Reconstrua e reinicie:
```bash
./build-deploy.sh prod
``` 
