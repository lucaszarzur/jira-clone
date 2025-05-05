import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JUser } from '@trungk18/interface/user';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AuthStore } from './auth.store';
import { environment } from 'src/environments/environment';
import { LoginPayload } from '@trungk18/project/auth/loginPayload';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl: string;
  constructor(private _http: HttpClient, private _store: AuthStore) {
    this.baseUrl = environment.apiUrl;
  }

  login({ email = '', password = '' }: LoginPayload) {
    this._store.setLoading(true);

    // Usar o primeiro usuário da API para autenticação (simulação)
    this._http
      .get<JUser[]>(`${this.baseUrl}/users`)
      .pipe(
        map((users) => {
          if (users && users.length > 0) {
            const user = users[0]; // Usar o primeiro usuário como usuário autenticado
            this._store.update((state) => ({
              ...state,
              ...user
            }));
          }
        }),
        finalize(() => {
          this._store.setLoading(false);
        }),
        catchError((err) => {
          this._store.setError(err);
          return of(err);
        })
      )
      .subscribe();
  }
}


