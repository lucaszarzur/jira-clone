import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectQuery } from './state/project/project.query';
import { ProjectService } from './state/project/project.service';
import { JProject } from '@trungk18/interface/project';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  project$: Observable<JProject>;
  expanded: boolean;

  constructor(
    private route: ActivatedRoute,
    private projectQuery: ProjectQuery,
    private projectService: ProjectService,
    private _authService: AuthService
  ) {
    this.project$ = this.projectQuery.selectActive();
    this.expanded = true;
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.params['id'];
    if (projectId) {
      this.projectService.getProjectById(projectId);
    }

    this.handleResize();
  }

  handleResize() {
    const match = window.matchMedia('(min-width: 1024px)');
    match.addEventListener('change', (e) => {
      console.log(e);
      this.expanded = e.matches;
    });
  }

  manualToggle() {
    this.expanded = !this.expanded;
  }
}
