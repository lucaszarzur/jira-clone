import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SimpleLoaderComponent } from './simple-loader.component';

@NgModule({
  declarations: [SimpleLoaderComponent],
  imports: [CommonModule],
  exports: [SimpleLoaderComponent]
})
export class SimpleLoaderModule {} 