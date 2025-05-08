import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthQuery } from '../project/auth/auth.query';
import { AuthService } from '../project/auth/auth.service';
import { ProjectService } from '../project/state/project/project.service';
import { ProjectQuery } from '../project/state/project/project.query';
import { JProject } from '@trungk18/interface/project';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  projects$: Observable<JProject[]>;
  isLoading$: Observable<boolean>;

  constructor(
    private router: Router,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private projectService: ProjectService,
    private projectQuery: ProjectQuery
  ) {
    this.isAuthenticated$ = this.authQuery.select(state => !!state.token);
    this.projects$ = this.projectQuery.selectAll();
    this.isLoading$ = this.projectQuery.selectLoading();
  }

  ngOnInit(): void {
    // Load public projects
    console.log('HomeComponent: Loading projects');
    this.projectService.getAll();

    // Debug: Check if projects are being received
    this.projects$.subscribe(projects => {
      console.log('HomeComponent: Projects received:', projects);
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/project']);
  }
}
