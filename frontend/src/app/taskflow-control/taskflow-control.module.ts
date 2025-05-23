import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgDefinitionsComponent } from './svg-definitions/svg-definitions.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from './button/button.component';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarComponent } from './avatar/avatar.component';

const TaskflowControlComponents = [
  SvgDefinitionsComponent,
  SvgIconComponent,
  BreadcrumbsComponent,
  ButtonComponent,
  InputComponent,
  AvatarComponent
];
@NgModule({
  declarations: TaskflowControlComponents,
  exports: TaskflowControlComponents,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TaskflowControlModule {}
