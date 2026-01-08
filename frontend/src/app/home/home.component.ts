import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from '../project/state/project/project.service';
import { ProjectQuery } from '../project/state/project/project.query';
import { JProject } from '@trungk18/interface/project';
import { AuthService, AuthUser } from '../core/services/auth.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LoginModalComponent } from './login-modal/login-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  projects$: Observable<JProject[]>;
  isLoading$: Observable<boolean>;
  currentUser$: Observable<AuthUser | null>;

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private projectQuery: ProjectQuery,
    private authService: AuthService,
    private modal: NzModalService
  ) {
    this.projects$ = this.projectQuery.selectAll();
    this.isLoading$ = this.projectQuery.selectLoading();
    this.currentUser$ = this.authService.currentUser;
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

  navigateToProject(projectId: string): void {
    this.router.navigate(['/project', projectId]);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/project']);
  }

  openLoginModal(): void {
    const modalRef = this.modal.create({
      nzTitle: null,
      nzContent: LoginModalComponent,
      nzFooter: null,
      nzWidth: 420
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        // Reload projects after login to show private projects
        this.projectService.getAll();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    // Reload projects to show only public ones
    this.projectService.getAll();
    window.location.reload();
  }
}
