import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JUser } from '@trungk18/interface/user';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  getUsers(): Observable<JUser[]> {
    return this.http.get<JUser[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: string): Observable<JUser> {
    return this.http.get<JUser>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: Partial<JUser>): Observable<JUser> {
    return this.http.post<JUser>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<JUser>): Observable<JUser> {
    return this.http.put<JUser>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }
}
