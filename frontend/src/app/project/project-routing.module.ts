import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './pages/board/board.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProjectComponent } from './project.component';
import { ProjectConst } from './config/const';
import { FullIssueDetailComponent } from './pages/full-issue-detail/full-issue-detail.component';
import { ProjectSettingsComponent } from './components/project-settings/project-settings.component';
import { ProjectPermissionsComponent } from './components/project-permissions/project-permissions.component';
import { AuthGuard } from './auth/auth.guard';
// Removed project settings component temporarily

const routes: Routes = [
  {
    path: ':id',
    component: ProjectComponent,
    children: [
      {
        path: 'board',
        component: BoardComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      // Removed project settings route temporarily
      {
        path: `issue/:${ProjectConst.IssueId}`,
        component: FullIssueDetailComponent
      },
      {
        path: '',
        redirectTo: 'board',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '140892', // Default to the demo project
    pathMatch: 'full'
  },
  {
    path: '',
    component: ProjectComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':id/settings',
        component: ProjectSettingsComponent
      },
      {
        path: ':id/permissions',
        component: ProjectPermissionsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
