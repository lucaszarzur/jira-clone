import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { JIssue } from '@trungk18/interface/issue';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IssueDeleteModalComponent } from '../issue-delete-modal/issue-delete-modal.component';
import { AddIssueModalComponent } from '../../add-issue-modal/add-issue-modal.component';
import { SelectParentIssueModalComponent } from '../../select-parent-issue-modal/select-parent-issue-modal.component';
import { DeleteIssueModel } from '@trungk18/interface/ui-model/delete-issue-model';
import { Observable } from 'rxjs';

@Component({
  selector: 'issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {
  @Input() issue: JIssue;
  @Input() isShowFullScreenButton: boolean;
  @Input() isShowCloseButton: boolean;
  @Output() onClosed = new EventEmitter();
  @Output() onOpenIssue = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<DeleteIssueModel>();

  canEdit$: Observable<boolean>;

  get canConvertToSubtask(): boolean {
    return this.issue &&
           this.issue.type !== 'Subtask' &&
           (!this.issue.subtasks || this.issue.subtasks.length === 0);
  }

  constructor(
    public projectQuery: ProjectQuery,
    private _modalService: NzModalService,
    private _projectService: ProjectService
  ) {}

  ngOnInit() {
    this.canEdit$ = this.projectQuery.canEdit$;
  }

  openDeleteIssueModal() {
    this._modalService.create({
      nzContent: IssueDeleteModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzStyle: {
        top: '140px'
      },
      nzComponentParams: {
        issueId: this.issue.id,
        onDelete: this.onDelete
      }
    });
  }

  closeModal() {
    this.onClosed.emit();
  }

  openIssuePage() {
    this.onOpenIssue.emit(this.issue.id);
  }

  addSubtask() {
    this._modalService.create({
      nzContent: AddIssueModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzWidth: 700,
      nzComponentParams: {
        parentIssueId: this.issue.id
      }
    });
  }

  openSubtask(subtaskId: string) {
    this.onOpenIssue.emit(subtaskId);
  }

  convertExistingIssueToSubtask() {
    const modalRef = this._modalService.create({
      nzContent: SelectParentIssueModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzWidth: 600,
      nzTitle: 'Select Issue to Convert',
      nzComponentParams: {
        currentIssueId: this.issue.id,
        projectId: this.issue.projectId,
        mode: 'convert-to-subtask' // New mode to distinguish behavior
      }
    });

    modalRef.afterClose.subscribe((issueIdToConvert: string | null) => {
      if (issueIdToConvert) {
        // Convert the selected issue to be a subtask of the CURRENT issue
        this._projectService.convertToSubtask(issueIdToConvert, this.issue.id);
      }
    });
  }

  openConvertToSubtaskModal() {
    const modalRef = this._modalService.create({
      nzContent: SelectParentIssueModalComponent,
      nzClosable: false,
      nzFooter: null,
      nzWidth: 600,
      nzComponentParams: {
        currentIssueId: this.issue.id,
        projectId: this.issue.projectId
      }
    });

    modalRef.afterClose.subscribe((parentIssueId: string | null) => {
      if (parentIssueId) {
        this._projectService.convertToSubtask(this.issue.id, parentIssueId);
        // Close the modal after conversion
        this.closeModal();
      }
    });
  }

  convertSubtaskToIssue() {
    this._projectService.convertToIssue(this.issue.id);
    // Close the modal after conversion
    this.closeModal();
  }
}
