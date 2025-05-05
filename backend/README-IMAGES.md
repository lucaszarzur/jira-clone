# Gerenciamento de Imagens no Jira Clone

Este documento descreve como o sistema gerencia imagens nas descrições de issues.

## Problema

Ao tentar salvar uma issue com uma imagem incorporada na descrição, o sistema pode enfrentar o erro "Data too long for column 'description' at row 1". Isso ocorre porque as imagens em formato base64 podem ser muito grandes para serem armazenadas diretamente no banco de dados.

## Solução

Implementamos uma solução que:

1. Extrai as imagens em base64 do conteúdo HTML da descrição
2. Salva as imagens como arquivos no servidor
3. Substitui o conteúdo base64 por URLs que apontam para os arquivos salvos

## Como Funciona

### Backend

1. Quando uma issue é criada ou atualizada, o sistema processa o conteúdo da descrição
2. As imagens em base64 são detectadas usando expressões regulares
3. Cada imagem é convertida em um arquivo e salva em `public/uploads/images/{issueId}/`
4. O conteúdo base64 na descrição é substituído por uma URL que aponta para o arquivo salvo

### Estrutura de Arquivos

```
backend/
├── public/
│   └── uploads/
│       └── images/
│           └── {issueId}/
│               ├── image1.png
│               ├── image2.jpg
│               └── ...
```

### Configuração do Banco de Dados

A coluna `description` na tabela `issues` foi alterada para o tipo `MEDIUMTEXT`, que pode armazenar até 16MB de dados, o que é suficiente para descrições com URLs de imagens.

### Frontend

O editor Quill foi configurado para permitir o upload de imagens. Quando uma imagem é inserida no editor, ela é automaticamente convertida para base64 e enviada ao servidor como parte da descrição.

## Limitações

- O tamanho máximo de uma requisição foi aumentado para 50MB, o que deve ser suficiente para a maioria dos casos
- As imagens são armazenadas no sistema de arquivos do servidor, não em um serviço de armazenamento em nuvem
- Não há limpeza automática de imagens não utilizadas

## Melhorias Futuras

- Implementar um serviço de armazenamento em nuvem (como AWS S3)
- Adicionar compressão de imagens
- Implementar limpeza de imagens não utilizadas
- Adicionar validação de tipos de arquivo e tamanho máximo
