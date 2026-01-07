import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectConst } from '@trungk18/project/config/const';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { JProject } from '@trungk18/interface/project';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { JIssue } from '@trungk18/interface/issue';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { DeleteIssueModel } from '@trungk18/interface/ui-model/delete-issue-model';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-full-issue-detail',
  templateUrl: './full-issue-detail.component.html',
  styleUrls: ['./full-issue-detail.component.scss']
})
@UntilDestroy()
export class FullIssueDetailComponent implements OnInit {
  project$: Observable<JProject>;
  issueById$: Observable<JIssue>;
  issueId: string;
  breadcrumbs$: Observable<string[]>;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _projectQuery: ProjectQuery,
    private _projectService: ProjectService
  ) {
    this.project$ = this._projectQuery.selectActive();
    this.breadcrumbs$ = this.project$.pipe(
      map(project => [ProjectConst.Projects, project?.name || '', 'Issues', this.issueId])
    );
  }

  ngOnInit(): void {
    this.getIssue();
  }

  deleteIssue({issueId, deleteModalRef}: DeleteIssueModel) {
    this._projectService.deleteIssue(issueId);
    deleteModalRef.close();
    this.backHome();
  }

  private getIssue(): void {
    this.issueId = this.route.snapshot.paramMap.get('issueId');
    if (this.issueId) {
      this.issueById$ = this._projectQuery.issueById$(this.issueId);
    }
  }

  private backHome() {
    this._router.navigate(['/']);
  }
}
