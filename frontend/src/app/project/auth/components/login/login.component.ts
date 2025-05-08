import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AuthQuery } from '../../auth.query';
import { Observable } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.loginForm.value).subscribe(
      response => {
        if (response && response.id) {
          this.message.success('Login successful!');
          this.router.navigate(['/project']);
        } else {
          this.message.error('Login failed. Please check your credentials.');
        }
        this.isSubmitting = false;
      },
      error => {
        this.message.error('Login failed: ' + (error.error?.message || 'Unknown error'));
        this.isSubmitting = false;
      }
    );
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
