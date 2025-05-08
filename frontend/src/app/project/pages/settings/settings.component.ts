import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectQuery } from '../../state/project/project.query';
import { ProjectService } from '../../state/project/project.service';
import { JProject, ProjectCategory } from '@trungk18/interface/project';
import { ProjectConst } from '../../config/const';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NoWhitespaceValidator } from '@trungk18/core/validators/no-whitespace.validator';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  project$: Observable<JProject>;
  projectForm: FormGroup;
  categories: ProjectCategory[];
  breadcrumbs: string[];

  constructor(
    private projectQuery: ProjectQuery,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.project$ = this.projectQuery.selectActive();
    this.categories = [
      ProjectCategory.BUSINESS,
      ProjectCategory.MARKETING,
      ProjectCategory.SOFTWARE
    ];

    this.initForm();

    this.project$.pipe(
      tap(project => {
        if (project) {
          this.updateForm(project);
          this.breadcrumbs = [ProjectConst.Projects, project.name, 'Settings'];
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {}

  initForm() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceValidator()]],
      description: [''],
      category: ['']
    });
  }

  private updateForm(project: JProject) {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      category: project.category
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      return;
    }

    const formValue = this.projectForm.value;

    this.project$.pipe(
      take(1),
      tap(project => {
        if (project) {
          const projectToUpdate: Partial<JProject> = {
            ...formValue,
            id: project.id
          };

          this.projectService.update(project.id, projectToUpdate).subscribe(
            () => {
              this.notification.success('Success', 'Project updated successfully');
              this.router.navigate(['/project', project.id]);
            },
            error => {
              this.notification.error('Error', 'Failed to update project');
            }
          );
        }
      })
    ).subscribe();
  }
}
