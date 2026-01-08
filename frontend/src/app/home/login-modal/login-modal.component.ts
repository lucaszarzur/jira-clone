import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AuthService } from '@trungk18/core/services/auth.service';
import { NotificationService } from '@trungk18/core/services/notification.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modal: NzModalRef,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.notificationService.success('Sucesso', `Bem-vindo, ${user.name}!`);
        this.modal.close(true);
        // Recarregar a página para atualizar os projetos
        window.location.reload();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro no login:', error);
        if (error.status === 401) {
          this.notificationService.error('Erro', 'Email ou senha inválidos');
        } else {
          this.notificationService.error('Erro', 'Erro ao fazer login. Tente novamente.');
        }
      }
    });
  }

  cancel(): void {
    this.modal.close(false);
  }
}
