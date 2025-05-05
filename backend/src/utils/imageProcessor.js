const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Processa imagens em base64 no conteúdo HTML, salva-as como arquivos e substitui por URLs
 * @param {string} htmlContent - Conteúdo HTML com imagens em base64
 * @param {string} issueId - ID da issue para organizar as imagens
 * @returns {string} - Conteúdo HTML com URLs de imagens
 */
const processImagesInContent = (htmlContent, issueId) => {
  if (!htmlContent) return htmlContent;
  
  // Diretório para salvar as imagens
  const uploadDir = path.join(__dirname, '../../public/uploads/images', issueId);
  
  // Cria o diretório se não existir
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Regex para encontrar imagens em base64
  const regex = /src="data:image\/(png|jpeg|jpg|gif|svg);base64,([^"]+)"/g;
  
  // Substitui cada imagem em base64 por uma URL
  return htmlContent.replace(regex, (match, imageType, base64Data) => {
    // Gera um nome de arquivo único
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${imageType}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Salva a imagem
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    
    // Retorna a URL da imagem
    return `src="/uploads/images/${issueId}/${fileName}"`;
  });
};

/**
 * Processa imagens em base64 no conteúdo HTML, salva-as como arquivos e substitui por URLs absolutas
 * @param {string} htmlContent - Conteúdo HTML com imagens em base64
 * @param {string} issueId - ID da issue para organizar as imagens
 * @param {string} baseUrl - URL base para gerar URLs absolutas
 * @returns {string} - Conteúdo HTML com URLs absolutas de imagens
 */
const processImagesWithAbsoluteUrls = (htmlContent, issueId, baseUrl) => {
  if (!htmlContent) return htmlContent;
  
  // Processa as imagens e obtém o conteúdo com URLs relativas
  const contentWithRelativeUrls = processImagesInContent(htmlContent, issueId);
  
  // Substitui URLs relativas por URLs absolutas
  const regex = /src="\/uploads\/images\/([^"]+)"/g;
  return contentWithRelativeUrls.replace(regex, (match, relativePath) => {
    return `src="${baseUrl}/uploads/images/${relativePath}"`;
  });
};

module.exports = {
  processImagesInContent,
  processImagesWithAbsoluteUrls
};
