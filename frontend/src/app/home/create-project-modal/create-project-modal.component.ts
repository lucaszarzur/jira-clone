import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ProjectCategory } from '@trungk18/interface/project';
import { NoWhitespaceValidator } from '@trungk18/core/validators/no-whitespace.validator';
import { AuthService } from '@trungk18/core/services/auth.service';

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html',
  styleUrls: ['./create-project-modal.component.scss']
})
export class CreateProjectModalComponent implements OnInit {
  projectForm: FormGroup;
  isLoading = false;
  categories = [
    { value: ProjectCategory.SOFTWARE, label: 'Software' },
    { value: ProjectCategory.MARKETING, label: 'Marketing' },
    { value: ProjectCategory.BUSINESS, label: 'Business' }
  ];

  constructor(
    private fb: FormBuilder,
    private modal: NzModalRef,
    private projectService: ProjectService,
    private notificationService: NzNotificationService,
    private authService: AuthService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceValidator()]],
      url: [''],
      description: [''],
      category: [ProjectCategory.SOFTWARE, [Validators.required]],
      isPublic: [false]
    });
  }

  ngOnInit(): void {}

  cancel(): void {
    this.modal.close();
  }

  createProject(): void {
    if (this.projectForm.invalid) {
      Object.values(this.projectForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    // Verificar se o usuário está autenticado
    if (!this.authService.currentUserValue) {
      this.notificationService.error('Erro', 'Você precisa estar logado para criar um projeto');
      return;
    }

    this.isLoading = true;
    const formValue = this.projectForm.value;

    this.projectService.createProject(formValue).subscribe({
      next: (project) => {
        this.notificationService.success('Sucesso', `Projeto "${project.name}" criado com sucesso!`);
        this.modal.close(project);
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.notificationService.error('Erro', 'Falha ao criar projeto. Tente novamente.');
        this.isLoading = false;
      }
    });
  }
}
