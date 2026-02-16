import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IssueType, JIssue, IssueStatus, IssuePriority } from '@trungk18/interface/issue';
import { quillConfiguration } from '@trungk18/project/config/editor';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { IssueUtil } from '@trungk18/project/utils/issue';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { JUser } from '@trungk18/interface/user';
import { tap, take } from 'rxjs/operators';
import { NoWhitespaceValidator } from '@trungk18/core/validators/no-whitespace.validator';
import { DateUtil } from '@trungk18/project/utils/date';
import { AuthService } from '@trungk18/core/services/auth.service';

@Component({
  selector: 'add-issue-modal',
  templateUrl: './add-issue-modal.component.html',
  styleUrls: ['./add-issue-modal.component.scss']
})
@UntilDestroy()
export class AddIssueModalComponent implements OnInit {
  reporterUsers$: Observable<JUser[]>;
  assignees$: Observable<JUser[]>;
  issueForm: FormGroup;
  editorOptions = quillConfiguration;
  parentIssueId?: string; // Can be set from modal params
  parentIssue?: JIssue; // Parent issue data if creating subtask

  get f() {
    return this.issueForm?.controls;
  }

  get isSubtask(): boolean {
    return !!this.parentIssueId;
  }

  constructor(
    private _fb: FormBuilder,
    private _modalRef: NzModalRef,
    private _projectService: ProjectService,
    private _projectQuery: ProjectQuery,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.initForm();

    // Definir o usuário logado como reporter
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.f.reporterId.patchValue(currentUser.id);
    }

    // If creating subtask, load parent issue data and set type to SUBTASK
    if (this.parentIssueId) {
      this.f.type.patchValue(IssueType.SUBTASK);
      this.f.type.disable(); // Disable type selection for subtasks

      // Load parent issue data
      this._projectQuery.issueById$(this.parentIssueId)
        .pipe(take(1))
        .subscribe(issue => {
          this.parentIssue = issue;
        });
    }

    this.reporterUsers$ = this._projectQuery.users$;
    this.assignees$ = this._projectQuery.users$;
  }

  initForm() {
    this.issueForm = this._fb.group({
      type: [IssueType.TASK],
      priority: [IssuePriority.MEDIUM],
      title: ['', NoWhitespaceValidator()],
      description: [''],
      reporterId: [''],
      userIds: [[]],
      parentIssueId: [null]
    });
  }

  submitForm() {
    if (this.issueForm.invalid) {
      return;
    }

    const now = DateUtil.getNow();

    // Obter o projeto ativo atual
    this._projectQuery.selectActive().pipe(take(1)).subscribe(project => {
      if (!project) {
        console.error('Nenhum projeto ativo encontrado');
        return;
      }

      const formValue = this.issueForm.getRawValue(); // Use getRawValue to include disabled fields

      const issue: JIssue = {
        ...formValue,
        id: IssueUtil.getRandomId(),
        status: IssueStatus.BACKLOG,
        createdAt: now,
        updatedAt: now,
        projectId: project.id,
        parentIssueId: this.parentIssueId || formValue.parentIssueId
      };

      // Criar uma nova issue usando o método HTTP POST
      this._projectService.createIssue(issue);
      this.closeModal();
    });
  }

  cancel() {
    this.closeModal();
  }

  closeModal() {
    this._modalRef.close();
  }
}
