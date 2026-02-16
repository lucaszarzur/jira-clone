import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { JIssue } from '@trungk18/interface/issue';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'select-parent-issue-modal',
  templateUrl: './select-parent-issue-modal.component.html',
  styleUrls: ['./select-parent-issue-modal.component.scss']
})
export class SelectParentIssueModalComponent implements OnInit {
  @Input() currentIssueId: string;
  @Input() projectId: string;
  @Input() mode: 'convert-current' | 'convert-to-subtask' = 'convert-current';
  @Input() modalTitle: string;
  @Input() modalDescription: string;
  @Input() confirmButtonText: string;

  availableIssues$: Observable<JIssue[]>;
  selectedParentId: string;
  searchTerm: string = '';

  constructor(
    private _modalRef: NzModalRef,
    private _projectQuery: ProjectQuery
  ) {}

  ngOnInit(): void {
    // Set default texts based on mode
    if (!this.modalTitle) {
      this.modalTitle = this.mode === 'convert-to-subtask'
        ? 'Select Issue to Convert'
        : 'Convert to Subtask';
    }
    if (!this.modalDescription) {
      this.modalDescription = this.mode === 'convert-to-subtask'
        ? 'Select an issue to convert into a subtask of the current issue:'
        : 'Select a parent issue for this subtask:';
    }
    if (!this.confirmButtonText) {
      this.confirmButtonText = 'Convert to Subtask';
    }

    this.availableIssues$ = this._projectQuery.issues$.pipe(
      map(issues => issues.filter(issue =>
        // Filter out current issue
        issue.id !== this.currentIssueId &&
        // Filter out subtasks (cannot be parent)
        issue.type !== 'Subtask' &&
        // Same project
        issue.projectId === this.projectId &&
        // Search filter
        (this.searchTerm === '' ||
         issue.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         issue.id.includes(this.searchTerm))
      ))
    );
  }

  selectParent(issueId: string) {
    this.selectedParentId = issueId;
  }

  isSelected(issueId: string): boolean {
    return this.selectedParentId === issueId;
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.ngOnInit(); // Refresh filter
  }

  confirm() {
    if (this.selectedParentId) {
      this._modalRef.close(this.selectedParentId);
    }
  }

  cancel() {
    this._modalRef.close(null);
  }
}
