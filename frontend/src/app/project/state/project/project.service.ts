import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { arrayRemove, arrayUpsert, setLoading } from '@datorama/akita';
import { JComment } from '@trungk18/interface/comment';
import { JIssue } from '@trungk18/interface/issue';
import { JProject } from '@trungk18/interface/project';
import { DateUtil } from '@trungk18/project/utils/date';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProjectStore } from './project.store';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  baseUrl: string;

  constructor(private _http: HttpClient, private _store: ProjectStore) {
    this.baseUrl = environment.apiUrl;
  }

  setLoading(isLoading: boolean) {
    this._store.setLoading(isLoading);
  }

  getProject() {
    this._http
      .get<JProject>(`${this.baseUrl}/projects/140892`)
      .pipe(
        setLoading(this._store),
        tap((project) => {
          this._store.update((state) => ({
              ...state,
              ...project
            }));
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  // Buscar comentários de uma issue
  getIssueComments(issueId: string) {
    return this._http
      .get<JComment[]>(`${this.baseUrl}/comments/issue/${issueId}`)
      .pipe(
        tap((comments) => {
          console.log('Comentários carregados:', comments);
          const allIssues = this._store.getValue().issues;
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
    // Verificar se o ID do projeto está definido
    if (!project.id) {
      // Obter o ID do projeto do estado atual
      const currentState = this._store.getValue();
      if (currentState && currentState.id) {
        project.id = currentState.id;
      } else {
        return; // Não é possível atualizar sem um ID
      }
    }

    this._http
      .put<JProject>(`${this.baseUrl}/projects/${project.id}`, project)
      .pipe(
        tap((updatedProject) => {
          this._store.update((state) => ({
            ...state,
            ...updatedProject
          }));
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  createIssue(issue: JIssue) {
    issue.updatedAt = DateUtil.getNow();
    issue.createdAt = DateUtil.getNow();

    this._http
      .post<JIssue>(`${this.baseUrl}/issues`, issue)
      .pipe(
        tap((newIssue) => {
          this._store.update((state) => {
            const issues = [...state.issues, newIssue];
            return {
              ...state,
              issues
            };
          });
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateIssue(issue: JIssue) {
    issue.updatedAt = DateUtil.getNow();

    this._http
      .put<JIssue>(`${this.baseUrl}/issues/${issue.id}`, issue)
      .pipe(
        tap((updatedIssue) => {
          this._store.update((state) => {
            const issues = arrayUpsert(state.issues, updatedIssue.id, updatedIssue);
            return {
              ...state,
              issues
            };
          });
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  deleteIssue(issueId: string) {
    this._http
      .delete(`${this.baseUrl}/issues/${issueId}`)
      .pipe(
        tap(() => {
          this._store.update((state) => {
            const issues = arrayRemove(state.issues, issueId);
            return {
              ...state,
              issues
            };
          });
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateIssueComment(issueId: string, comment: JComment) {
    if (comment.id) {
      // Atualizar comentário existente
      this._http
        .put<JComment>(`${this.baseUrl}/comments/${comment.id}`, comment)
        .pipe(
          tap((updatedComment) => {
            const allIssues = this._store.getValue().issues;
            const issue = allIssues.find((x) => x.id === issueId);
            if (!issue) {
              return;
            }

            const comments = arrayUpsert(issue.comments ?? [], updatedComment.id, updatedComment);
            this.updateIssue({
              ...issue,
              comments
            });
          }),
          catchError((error) => {
            // Se o comentário não for encontrado (404), criar um novo
            if (error.status === 404) {
              console.log('Comentário não encontrado, criando um novo');

              // Garantir que o userId esteja definido
              if (!comment.userId && comment.user) {
                comment.userId = comment.user.id;
              }

              // Criar novo comentário usando POST
              this._http
                .post<JComment>(`${this.baseUrl}/comments`, comment)
                .pipe(
                  tap((newComment) => {
                    const allIssues = this._store.getValue().issues;
                    const issue = allIssues.find((x) => x.id === issueId);
                    if (!issue) {
                      return;
                    }

                    const comments = arrayUpsert(issue.comments ?? [], newComment.id, newComment);
                    this.updateIssue({
                      ...issue,
                      comments
                    });
                  }),
                  catchError((postError) => {
                    console.error('Erro ao criar comentário:', postError);
                    this._store.setError(postError);
                    return of(postError);
                  })
                )
                .subscribe();
              return of(null);
            }

            this._store.setError(error);
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

      this._http
        .post<JComment>(`${this.baseUrl}/comments`, comment)
        .pipe(
          tap((newComment) => {
            const allIssues = this._store.getValue().issues;
            const issue = allIssues.find((x) => x.id === issueId);
            if (!issue) {
              return;
            }

            const comments = arrayUpsert(issue.comments ?? [], newComment.id, newComment);
            this.updateIssue({
              ...issue,
              comments
            });
          }),
          catchError((error) => {
            console.error('Erro ao criar comentário:', error);
            this._store.setError(error);
            return of(error);
          })
        )
        .subscribe();
    }
  }
}
