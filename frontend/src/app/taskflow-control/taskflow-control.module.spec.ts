import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TaskflowControlModule } from './taskflow-control.module';

describe('TaskflowControlModule', () => {
  let module: TaskflowControlModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TaskflowControlModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
  });

  it('should create an instance', () => {
    module = TestBed.inject(TaskflowControlModule);
    expect(module).toBeTruthy();
  });
});
