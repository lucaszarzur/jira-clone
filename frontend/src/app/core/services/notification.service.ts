import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private notification: NzNotificationService) {}

  /**
   * Exibe uma notificação de sucesso
   */
  success(title: string, message: string): void {
    this.notification.success(title, message);
  }

  /**
   * Exibe uma notificação de erro
   */
  error(title: string, message: string): void {
    this.notification.error(title, message);
  }

  /**
   * Exibe uma notificação de informação
   */
  info(title: string, message: string): void {
    this.notification.info(title, message);
  }

  /**
   * Exibe uma notificação de aviso
   */
  warning(title: string, message: string): void {
    this.notification.warning(title, message);
  }

  /**
   * Trata erros HTTP e exibe notificações apropriadas
   */
  handleHttpError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.error(
        'Não autorizado',
        'Você não está autorizado a realizar esta ação.'
      );
    } else if (error.status === 403) {
      this.error(
        'Acesso negado', 
        'Você não tem permissão para realizar esta ação.'
      );
    } else if (error.status === 404) {
      this.error(
        'Não encontrado', 
        'O recurso solicitado não foi encontrado.'
      );
    } else if (error.status === 500) {
      this.error(
        'Erro no servidor', 
        'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'
      );
    } else {
      this.error(
        'Erro', 
        error.message || 'Ocorreu um erro ao processar sua solicitação.'
      );
    }
  }
}
