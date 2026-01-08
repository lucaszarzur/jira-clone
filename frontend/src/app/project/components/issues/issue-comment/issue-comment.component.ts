import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JComment } from '@trungk18/interface/comment';
import { JUser } from '@trungk18/interface/user';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ImageUrlService } from '@trungk18/project/services/image-url.service';
import { SafeHtml } from '@angular/platform-browser';
import { quillConfiguration } from '@trungk18/project/config/editor';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { AuthService } from '@trungk18/core/services/auth.service';

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
  private initialized = false;

  constructor(
    private _projectQuery: ProjectQuery,
    private projectService: ProjectService,
    private _imageUrlService: ImageUrlService,
    private authService: AuthService
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
    this._projectQuery.users$.pipe(untilDestroyed(this)).subscribe((users) => {
      if (this.initialized && this.commentControl) {
        return;
      }
      const fallbackUser: JUser = {
        id: 'guest',
        name: 'Guest',
        email: '',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        issueIds: []
      };

      // Usar o usuário autenticado se estiver criando um novo comentário
      if (this.createMode) {
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          // Converter AuthUser para JUser
          this.user = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            issueIds: []
          };
        } else {
          this.user = fallbackUser;
        }
      } else {
        // Para comentários existentes, usar o usuário do comentário
        this.user = this.comment?.user ?? fallbackUser;
      }

      if (this.createMode && !this.comment) {
        this.comment = new JComment(this.issueId, this.user);
      }
      if (!this.commentControl) {
        this.commentControl = new FormControl(this.comment?.body ?? '');
      }
      if (!this.createMode && this.comment?.body) {
        // Inicializar o controle com o conteúdo existente
        this.processedBody = this._imageUrlService.processImageUrls(this.comment.body);
      }
      this.initialized = true;
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
