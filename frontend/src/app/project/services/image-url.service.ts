import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Processa o conteúdo HTML para substituir URLs relativas por URLs absolutas
   * @param htmlContent Conteúdo HTML com URLs relativas
   * @returns Conteúdo HTML com URLs absolutas
   */
  processImageUrls(htmlContent: string): SafeHtml {
    if (!htmlContent) {
      return '';
    }

    // Substitui URLs relativas por URLs absolutas
    const processedContent = htmlContent.replace(
      /src="\/uploads\/images\/([^"]+)"/g,
      (match, relativePath) => {
        return `src="${environment.baseUrl}/uploads/images/${relativePath}"`;
      }
    );

    // Retorna o conteúdo HTML sanitizado
    return this.sanitizer.bypassSecurityTrustHtml(processedContent);
  }
}
