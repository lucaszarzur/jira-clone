import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleAnalyticsService } from '@trungk18/core/services/google-analytics.service';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
  breadcrumbs: string[] = ['Projects', 'Angular Jira Clone', 'Kanban Board'];
  private refreshInterval: any;
  private refreshIntervalTime = 60000; // 60 segundos

  constructor(
    private _googleAnalytics: GoogleAnalyticsService,
    private projectService: ProjectService,
    private projectQuery: ProjectQuery
  ) {}

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    // Recarregar dados do projeto a cada 5 segundos
    this.refreshInterval = setInterval(() => {
      // Só recarregar se a página estiver visível
      if (!document.hidden) {
        this.projectQuery.selectActive().subscribe(currentProject => {
          if (currentProject) {
            this.projectService.getProject(currentProject.id);
          }
        }).unsubscribe();
      }
    }, this.refreshIntervalTime);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  sendTwitterEventButton() {
    this._googleAnalytics.sendEvent('Share Twitter', 'button');
  }
}
