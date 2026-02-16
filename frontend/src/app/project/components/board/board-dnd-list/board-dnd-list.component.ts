import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IssueStatus, IssueStatusDisplay, JIssue } from '@trungk18/interface/issue';
import { FilterState } from '@trungk18/project/state/filter/filter.store';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { Observable, combineLatest } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { FilterQuery } from '@trungk18/project/state/filter/filter.query';
import * as dateFns from 'date-fns';
import { IssueUtil } from '@trungk18/project/utils/issue';

@Component({
  selector: '[board-dnd-list]',
  templateUrl: './board-dnd-list.component.html',
  styleUrls: ['./board-dnd-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
@UntilDestroy()
export class BoardDndListComponent implements OnInit {
  @Input() status: IssueStatus;
  @Input() currentUserId: string;
  @Input() issues$: Observable<JIssue[]>;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  IssueStatusDisplay = IssueStatusDisplay;
  issues: JIssue[] = [];
  canEdit: boolean = true;

  get issuesCount(): number {
    return this.issues.length;
  }

  constructor(
    private _projectService: ProjectService,
    private _filterQuery: FilterQuery,
    private _projectQuery: ProjectQuery
  ) {}

  ngOnInit(): void {
    combineLatest([this.issues$, this._filterQuery.all$])
      .pipe(untilDestroyed(this))
      .subscribe(([issues, filter]) => {
        this.issues = this.filterIssues(issues, filter);
      });

    this._projectQuery.canEdit$
      .pipe(untilDestroyed(this))
      .subscribe(canEdit => {
        this.canEdit = canEdit;
      });
  }

  drop(event: CdkDragDrop<JIssue[]>) {
    const newIssue: JIssue = { ...event.item.data };
    const newIssues = [...event.container.data];
    if (event.previousContainer === event.container) {
      // Movendo dentro da mesma coluna - apenas atualiza posições
      moveItemInArray(newIssues, event.previousIndex, event.currentIndex);
      this.updateListPosition(newIssues, false);
    } else {
      // Movendo entre colunas - atualiza status e posições
      transferArrayItem(
        event.previousContainer.data,
        newIssues,
        event.previousIndex,
        event.currentIndex
      );
      // Atualizar o status do item movido ANTES de enviar os PUTs
      const newStatus = event.container.id as IssueStatus;
      newIssues[event.currentIndex] = { ...newIssues[event.currentIndex], status: newStatus };
      this.updateListPosition(newIssues, false);
    }
  }

  filterIssues(issues: JIssue[], filter: FilterState): JIssue[] {
    const { onlyMyIssue, ignoreResolved, searchTerm, userIds } = filter;
    return issues.filter((issue) => {
      // Don't show subtasks as separate cards - they will be shown nested under parent
      const isNotSubtask = issue.type !== 'Subtask';

      const isMatchTerm = searchTerm ? IssueUtil.searchString(issue.title, searchTerm) : true;

      const isIncludeUsers = userIds?.length
        ? issue.userIds?.some((userId) => userIds.includes(userId)) ?? false
        : true;

      const isMyIssue = onlyMyIssue
        ? this.currentUserId && issue.userIds?.includes(this.currentUserId)
        : true;

      const isIgnoreResolved = ignoreResolved ? issue.status !== IssueStatus.DONE : true;

      return isNotSubtask && isMatchTerm && isIncludeUsers && isMyIssue && isIgnoreResolved;
    });
  }

  isDateWithinThreeDaysFromNow(date: string) {
    const now = new Date();
    const inputDate = new Date(date);
    return dateFns.isAfter(inputDate, dateFns.subDays(now, 3));
  }

  private updateListPosition(newList: JIssue[], showNotification: boolean = false) {
    newList.forEach((issue, idx) => {
      const newIssueWithNewPosition = { ...issue, listPosition: idx + 1 };
      this._projectService.updateIssue(newIssueWithNewPosition, showNotification);
    });
  }
}
