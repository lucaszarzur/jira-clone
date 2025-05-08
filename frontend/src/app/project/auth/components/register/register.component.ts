import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AuthQuery } from '../../auth.query';
import { Observable } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading$: Observable<boolean>;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authQuery: AuthQuery,
    private router: Router,
    private message: NzMessageService
  ) {
    this.isLoading$ = this.authQuery.selectLoading();
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe(
      response => {
        if (response && response.id) {
          this.message.success('Registration successful!');
          this.router.navigate(['/project']);
        } else {
          this.message.error('Registration failed. Please try again.');
        }
        this.isSubmitting = false;
      },
      error => {
        this.message.error('Registration failed: ' + (error.error?.message || 'Unknown error'));
        this.isSubmitting = false;
      }
    );
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
