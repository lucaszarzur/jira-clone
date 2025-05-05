import Quill from 'quill';
import ImageResize from 'quill-image-resize';

// Registrar o módulo de redimensionamento de imagens
try {
  Quill.register('modules/imageResize', ImageResize);
  console.log('Módulo de redimensionamento de imagens registrado com sucesso');
} catch (error) {
  console.warn('Erro ao registrar o módulo de redimensionamento de imagens:', error);
}

// Não exportamos mais a configuração daqui, ela está definida diretamente no app.module.ts
