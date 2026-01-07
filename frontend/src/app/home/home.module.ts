import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NzSpinModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
