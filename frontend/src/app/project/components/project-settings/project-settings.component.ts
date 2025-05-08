import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProjectService } from '../../state/project/project.service';
import { ProjectQuery } from '../../state/project/project.query';
import { Observable } from 'rxjs';
import { JProject } from '@trungk18/interface/project';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent implements OnInit {
  projectForm: FormGroup;
  project$: Observable<JProject>;
  isSubmitting = false;
  projectId: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private projectQuery: ProjectQuery,
    private message: NzMessageService
  ) {
    this.project$ = this.projectQuery.selectActive();
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.initForm();
    this.loadProject();
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      category: [''],
      isPublic: [false]
    });
  }

  loadProject(): void {
    this.project$.subscribe(project => {
      if (project) {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
          category: project.category,
          isPublic: project.isPublic
        });
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      Object.values(this.projectForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSubmitting = true;
    this.projectService.update(this.projectId, this.projectForm.value).subscribe(
      () => {
        this.message.success('Project updated successfully');
        this.isSubmitting = false;
      },
      error => {
        this.message.error('Failed to update project: ' + (error.error?.message || 'Unknown error'));
        this.isSubmitting = false;
      }
    );
  }
}
