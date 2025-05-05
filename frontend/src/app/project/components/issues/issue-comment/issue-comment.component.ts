import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JComment } from '@trungk18/interface/comment';
import { JUser } from '@trungk18/interface/user';
import { AuthQuery } from '@trungk18/project/auth/auth.query';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ImageUrlService } from '@trungk18/project/services/image-url.service';
import { SafeHtml } from '@angular/platform-browser';
import { quillConfiguration } from '@trungk18/project/config/editor';

@Component({
  selector: 'issue-comment',
  templateUrl: './issue-comment.component.html',
  styleUrls: ['./issue-comment.component.scss']
})
@UntilDestroy()
export class IssueCommentComponent implements OnInit {
  @Input() issueId: string;
  @Input() comment: JComment;
  @Input() createMode: boolean;
  @ViewChild('commentBoxRef') commentBoxRef: ElementRef;
  commentControl: FormControl;
  user: JUser;
  isEditing: boolean;
  processedBody: SafeHtml;
  editorOptions = quillConfiguration;

  constructor(
    private _authQuery: AuthQuery,
    private projectService: ProjectService,
    private _imageUrlService: ImageUrlService
  ) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.createMode || this.isEditing) {
      return;
    }
    if (event.key === 'M') {
      this.commentBoxRef.nativeElement.focus();
      this.isEditing = true;
    }
  }

  ngOnInit(): void {
    this._authQuery.user$.pipe(untilDestroyed(this)).subscribe((user) => {
      this.user = user;
      if (this.createMode) {
        this.comment = new JComment(this.issueId, this.user);
        this.commentControl = new FormControl('');
      } else if (this.comment?.body) {
        // Inicializar o controle com o conteúdo existente
        this.commentControl = new FormControl(this.comment.body);
        // Processar as URLs das imagens no corpo do comentário
        this.processedBody = this._imageUrlService.processImageUrls(this.comment.body);
      } else {
        this.commentControl = new FormControl('');
      }
    });
  }

  setCommentEdit(mode: boolean) {
    this.isEditing = mode;
    if (mode && this.comment?.body) {
      // Quando entrar no modo de edição, inicializar o controle com o conteúdo existente
      this.commentControl.setValue(this.comment.body);
    }
  }

  addComment() {
    const now = new Date();
    const commentBody = this.commentControl.value;

    this.projectService.updateIssueComment(this.issueId, {
      ...this.comment,
      id: `${now.getTime()}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      body: commentBody
    });

    // Processar as URLs das imagens no corpo do comentário
    this.processedBody = this._imageUrlService.processImageUrls(commentBody);

    this.cancelAddComment();
  }

  cancelAddComment() {
    this.commentControl.patchValue('');
    this.setCommentEdit(false);
  }

  updateComment() {
    const commentBody = this.commentControl.value;

    this.projectService.updateIssueComment(this.issueId, {
      ...this.comment,
      updatedAt: new Date().toISOString(),
      body: commentBody
    });

    // Processar as URLs das imagens no corpo do comentário atualizado
    this.processedBody = this._imageUrlService.processImageUrls(commentBody);

    this.setCommentEdit(false);
  }
}
