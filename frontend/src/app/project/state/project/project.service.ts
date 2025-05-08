import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { arrayRemove, arrayUpsert, setLoading } from '@datorama/akita';
import { NotificationService } from '@trungk18/core/services/notification.service';
import { JComment } from '@trungk18/interface/comment';
import { JIssue } from '@trungk18/interface/issue';
import { JProject } from '@trungk18/interface/project';
import { DateUtil } from '@trungk18/project/utils/date';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/auth.service';
import { ProjectStore } from './project.store';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private store: ProjectStore,
    private _notificationService: NotificationService,
    private _authService: AuthService
  ) {
    this.baseUrl = environment.apiUrl;
    console.log('ProjectService initialized with baseUrl:', this.baseUrl);
  }

  setLoading(isLoading: boolean) {
    console.log('Setting loading state:', isLoading);
    this.store.setLoading(isLoading);
  }

  // Get all projects (public for anonymous users, all for authenticated users)
  getAll() {
    console.log('Getting all projects from:', `${this.baseUrl}/projects`);
    this.setLoading(true);
    this.http
      .get<JProject[]>(`${this.baseUrl}/projects`)
      .pipe(
        tap((projects) => {
          console.log('Projects received:', projects);
          this.store.update((state) => ({
            ...state,
            projects
          }));
          this.setLoading(false);
        }),
        catchError((error) => {
          console.error('Error getting projects:', error);
          this.store.setError(error);
          this.setLoading(false);
          return of(error);
        })
      )
      .subscribe();
  }

  // Get a specific project by ID
  getProject(projectId: string = '140892') {
    this.http
      .get<JProject>(`${this.baseUrl}/projects/${projectId}`)
      .pipe(
        setLoading(this.store),
        tap((project) => {
          this.store.update((state) => ({
            ...state,
            project
          }));
        }),
        catchError((error) => {
          this.store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  // Buscar comentários de uma issue
  getIssueComments(issueId: string) {
    return this.http
      .get<JComment[]>(`${this.baseUrl}/comments/issue/${issueId}`)
      .pipe(
        tap((comments) => {
          console.log('Comentários carregados:', comments);
          const allIssues = this.store.getValue().issues;
          const issue = allIssues.find((x) => x.id === issueId);
          if (!issue) {
            return;
          }

          // Atualizar a issue com os comentários
          this.updateIssue({
            ...issue,
            comments: comments
          });
        }),
        catchError((error) => {
          console.error('Erro ao carregar comentários:', error);
          return of([]);
        })
      );
  }

  updateProject(project: Partial<JProject>) {
    if (!project.id) {
      const currentState = this.store.getValue();
      if (currentState.project?.id) {
        project.id = currentState.project.id;
      } else {
        return;
      }
    }

    this.http
      .put<JProject>(`${this.baseUrl}/projects/${project.id}`, project)
      .pipe(
        tap((updatedProject) => {
          this.store.update((state) => ({
            ...state,
            project: updatedProject
          }));
        }),
        catchError((error) => {
          this.store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  createIssue(issue: JIssue) {
    // Verificar se o usuário está autenticado
    if (!this._authService.isAuthenticated()) {
      this._notificationService.error(
        'Autenticação necessária',
        'Você precisa estar logado para criar uma issue. Por favor, faça login.'
      );
      return;
    }

    issue.updatedAt = DateUtil.getNow();
    issue.createdAt = DateUtil.getNow();

    this.http
      .post<JIssue>(`${this.baseUrl}/issues`, issue)
      .pipe(
        tap((newIssue) => {
          this.store.update((state) => {
            const issues = [...state.issues, newIssue];
            return {
              ...state,
              issues
            };
          });
          this._notificationService.success('Sucesso', 'Issue criada com sucesso!');
        }),
        catchError((error: HttpErrorResponse) => {
          this.store.setError(error);
          this._notificationService.handleHttpError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateIssue(issue: JIssue) {
    // Verificar se o usuário está autenticado
    if (!this._authService.isAuthenticated()) {
      this._notificationService.error(
        'Autenticação necessária',
        'Você precisa estar logado para atualizar uma issue. Por favor, faça login.'
      );
      return;
    }

    issue.updatedAt = DateUtil.getNow();

    this.http
      .put<JIssue>(`${this.baseUrl}/issues/${issue.id}`, issue)
      .pipe(
        tap((updatedIssue) => {
          this.store.update((state) => {
            const issues = arrayUpsert(state.issues, updatedIssue.id, updatedIssue);
            return {
              ...state,
              issues
            };
          });
          this._notificationService.success('Sucesso', 'Issue atualizada com sucesso!');
        }),
        catchError((error: HttpErrorResponse) => {
          this.store.setError(error);
          this._notificationService.handleHttpError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  deleteIssue(issueId: string) {
    // Verificar se o usuário está autenticado
    if (!this._authService.isAuthenticated()) {
      this._notificationService.error(
        'Autenticação necessária',
        'Você precisa estar logado para excluir uma issue. Por favor, faça login.'
      );
      return;
    }

    this.http
      .delete(`${this.baseUrl}/issues/${issueId}`)
      .pipe(
        tap(() => {
          this.store.update((state) => {
            const issues = arrayRemove(state.issues, issueId);
            return {
              ...state,
              issues
            };
          });
          this._notificationService.success('Sucesso', 'Issue excluída com sucesso!');
        }),
        catchError((error: HttpErrorResponse) => {
          this.store.setError(error);
          this._notificationService.handleHttpError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateIssueComment(issueId: string, comment: JComment) {
    // Verificar se o usuário está autenticado
    if (!this._authService.isAuthenticated()) {
      this._notificationService.error(
        'Autenticação necessária',
        'Você precisa estar logado para adicionar ou atualizar comentários. Por favor, faça login.'
      );
      return;
    }

    if (comment.id) {
      // Atualizar comentário existente
      this.http
        .put<JComment>(`${this.baseUrl}/comments/${comment.id}`, comment)
        .pipe(
          tap((updatedComment) => {
            const allIssues = this.store.getValue().issues;
            const issue = allIssues.find((x) => x.id === issueId);
            if (!issue) {
              return;
            }

            const comments = arrayUpsert(issue.comments ?? [], updatedComment.id, updatedComment);
            this.updateIssue({
              ...issue,
              comments
            });
            this._notificationService.success('Sucesso', 'Comentário atualizado com sucesso!');
          }),
          catchError((error: HttpErrorResponse) => {
            // Se o comentário não for encontrado (404), criar um novo
            if (error.status === 404) {
              console.log('Comentário não encontrado, criando um novo');

              // Garantir que o userId esteja definido
              if (!comment.userId && comment.user) {
                comment.userId = comment.user.id;
              }

              // Criar novo comentário usando POST
              this.http
                .post<JComment>(`${this.baseUrl}/comments`, comment)
                .pipe(
                  tap((newComment) => {
                    const allIssues = this.store.getValue().issues;
                    const issue = allIssues.find((x) => x.id === issueId);
                    if (!issue) {
                      return;
                    }

                    const comments = arrayUpsert(issue.comments ?? [], newComment.id, newComment);
                    this.updateIssue({
                      ...issue,
                      comments
                    });
                    this._notificationService.success('Sucesso', 'Comentário adicionado com sucesso!');
                  }),
                  catchError((postError: HttpErrorResponse) => {
                    console.error('Erro ao criar comentário:', postError);
                    this.store.setError(postError);
                    this._notificationService.handleHttpError(postError);
                    return of(postError);
                  })
                )
                .subscribe();
              return of(null);
            }

            this.store.setError(error);
            this._notificationService.handleHttpError(error);
            return of(error);
          })
        )
        .subscribe();
    } else {
      // Criar novo comentário

      // Garantir que o userId esteja definido
      if (!comment.userId && comment.user) {
        comment.userId = comment.user.id;
      }

      this.http
        .post<JComment>(`${this.baseUrl}/comments`, comment)
        .pipe(
          tap((newComment) => {
            const allIssues = this.store.getValue().issues;
            const issue = allIssues.find((x) => x.id === issueId);
            if (!issue) {
              return;
            }

            const comments = arrayUpsert(issue.comments ?? [], newComment.id, newComment);
            this.updateIssue({
              ...issue,
              comments
            });
            this._notificationService.success('Sucesso', 'Comentário adicionado com sucesso!');
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Erro ao criar comentário:', error);
            this.store.setError(error);
            this._notificationService.handleHttpError(error);
            return of(error);
          })
        )
        .subscribe();
    }
  }

  getProjectById(id: string) {
    console.log('Getting project by ID:', id, 'from:', `${this.baseUrl}/projects/${id}`);
    this.setLoading(true);
    return this.http.get<JProject>(`${this.baseUrl}/projects/${id}`).pipe(
      tap(project => {
        console.log('Project received:', project);
        this.store.update(state => ({
          ...state,
          project,
          loading: false,
          error: null
        }));
      }),
      catchError(error => {
        console.error('Error getting project:', error);
        this.store.setError(error);
        this.setLoading(false);
        return of(null);
      })
    );
  }

  update(id: string, data: Partial<JProject>) {
    console.log('Updating project:', id, 'with data:', data);
    this.setLoading(true);
    return this.http.put<JProject>(`${this.baseUrl}/projects/${id}`, data).pipe(
      tap(project => {
        console.log('Project updated successfully:', project);
        this.store.update(state => ({
          ...state,
          project,
          loading: false,
          error: null
        }));
      }),
      catchError(error => {
        console.error('Error updating project:', error);
        this.store.setError(error);
        this.setLoading(false);
        return of(null);
      })
    );
  }
}
