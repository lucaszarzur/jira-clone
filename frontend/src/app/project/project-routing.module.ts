import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './pages/board/board.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProjectComponent } from './project.component';
import { ProjectConst } from './config/const';
import { FullIssueDetailComponent } from './pages/full-issue-detail/full-issue-detail.component';
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
