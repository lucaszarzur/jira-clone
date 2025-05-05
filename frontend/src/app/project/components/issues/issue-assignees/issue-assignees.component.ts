import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { JIssue } from '@trungk18/interface/issue';
import { JUser } from '@trungk18/interface/user';
import { ProjectService } from '@trungk18/project/state/project/project.service';

@Component({
  selector: 'issue-assignees',
  templateUrl: './issue-assignees.component.html',
  styleUrls: ['./issue-assignees.component.scss']
})
@UntilDestroy()
export class IssueAssigneesComponent implements OnInit, OnChanges {
  @Input() issue: JIssue;
  @Input() users: JUser[];
  assignees: JUser[];

  constructor(private _projectService: ProjectService) {}

  ngOnInit(): void {
    this.updateAssignees();
  }

  ngOnChanges(changes: SimpleChanges) {
    const issueChange = changes.issue;
    if (this.users && issueChange?.currentValue !== issueChange?.previousValue) {
      this.updateAssignees();
    }
  }

  private updateAssignees() {
    if (this.issue?.userIds && this.users) {
      this.assignees = this.issue.userIds.map((userId) => this.users.find((x) => x.id === userId));
    } else {
      this.assignees = [];
    }
  }

  removeUser(userId: string) {
    if (this.issue?.userIds) {
      const newUserIds = this.issue.userIds.filter((x) => x !== userId);
      this._projectService.updateIssue({
        ...this.issue,
        userIds: newUserIds
      });
    }
  }

  addUserToIssue(user: JUser) {
    if (this.issue?.userIds) {
      const updatedIssue = {
        ...this.issue,
        userIds: [...this.issue.userIds, user.id]
      };
      this._projectService.updateIssue(updatedIssue);
    }
  }

  isUserSelected(user: JUser): boolean {
    return this.issue?.userIds?.includes(user.id) || false;
  }
}
