import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { JIssue } from '@trungk18/interface/issue';
import { ProjectService } from '@trungk18/project/state/project/project.service';

@Component({
  selector: 'issue-comments',
  templateUrl: './issue-comments.component.html',
  styleUrls: ['./issue-comments.component.scss']
})
export class IssueCommentsComponent implements OnInit, OnChanges {
  @Input() issue: JIssue;
  @Input() canEdit: boolean = true;
  isLoading = false;
  private commentsLoadedForIssueId: string | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    if (this.issue?.id && this.commentsLoadedForIssueId !== this.issue.id) {
      this.loadComments();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Carregar comentários quando a issue mudar
    if (changes.issue && changes.issue.currentValue?.id !== changes.issue.previousValue?.id
        && this.commentsLoadedForIssueId !== changes.issue.currentValue?.id) {
      this.loadComments();
    }
  }

  loadComments(): void {
    if (!this.issue?.id) {
      return;
    }

    this.isLoading = true;
    this.commentsLoadedForIssueId = this.issue.id;
    this.projectService.getIssueComments(this.issue.id)
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}
