import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [
    HomeComponent,
    LoginModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
