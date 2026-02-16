import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { JIssue, SubtaskSummary } from '@trungk18/interface/issue';

@Component({
  selector: 'issue-subtasks',
  templateUrl: './issue-subtasks.component.html',
  styleUrls: ['./issue-subtasks.component.scss']
})
@UntilDestroy()
export class IssueSubtasksComponent {
  @Input() issue: JIssue;
  @Input() canEdit: boolean = true;
  @Output() onAddSubtask = new EventEmitter<void>();
  @Output() onConvertToSubtask = new EventEmitter<void>();
  @Output() onOpenSubtask = new EventEmitter<string>();

  get subtasks(): SubtaskSummary[] {
    return this.issue?.subtasks || [];
  }

  get completedCount(): number {
    return this.subtasks.filter((st) => st.status === 'Done').length;
  }

  get totalCount(): number {
    return this.subtasks.length;
  }

  addSubtask() {
    this.onAddSubtask.emit();
  }

  convertToSubtask() {
    this.onConvertToSubtask.emit();
  }

  openSubtask(subtaskId: string) {
    this.onOpenSubtask.emit(subtaskId);
  }
}
