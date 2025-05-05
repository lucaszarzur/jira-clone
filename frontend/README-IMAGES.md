# Gerenciamento de Imagens no Editor Quill

Este documento descreve como o sistema gerencia imagens no editor Quill.

## Configuração do Editor

O editor Quill foi configurado para permitir o upload e redimensionamento de imagens. A configuração é feita nos seguintes arquivos:

- `src/app/project/config/quill-config.ts` - Registra o módulo de redimensionamento de imagens
- `src/app/project/config/editor.ts` - Configuração do editor para uso nos componentes
- `src/app/app.module.ts` - Configuração global do Quill para a aplicação

## Funcionalidades de Imagem

### Upload de Imagens

O editor permite o upload de imagens de duas maneiras:

1. **Botão de imagem na barra de ferramentas** - Clique no botão de imagem e selecione uma imagem do seu computador
2. **Copiar e colar** - Copie uma imagem e cole-a diretamente no editor

### Redimensionamento de Imagens

O módulo `quill-image-resize` foi integrado para permitir o redimensionamento de imagens. Quando uma imagem é inserida no editor, você pode:

1. Clicar na imagem para selecioná-la
2. Arrastar as alças nos cantos para redimensionar a imagem
3. Ver o tamanho atual da imagem em pixels

## Processamento de Imagens no Backend

Quando uma issue é criada ou atualizada com imagens na descrição, o backend:

1. Extrai as imagens em base64 do conteúdo HTML
2. Salva as imagens como arquivos no servidor
3. Substitui o conteúdo base64 por URLs que apontam para os arquivos salvos

Isso evita o erro "Data too long for column 'description'" que ocorre quando imagens grandes são armazenadas diretamente no banco de dados.

## Limitações

- O tamanho máximo de uma requisição foi aumentado para 50MB
- As imagens são armazenadas no sistema de arquivos do servidor
- Não há limpeza automática de imagens não utilizadas

## Solução de Problemas

Se você encontrar problemas com o redimensionamento de imagens, verifique:

1. Se o módulo `quill-image-resize` está instalado corretamente
2. Se o módulo está registrado corretamente no Quill
3. Se a configuração do editor inclui o módulo `imageResize`

Para mais informações, consulte a [documentação do Quill](https://quilljs.com/docs/modules/toolbar/) e a [documentação do quill-image-resize](https://github.com/kensnyder/quill-image-resize).
