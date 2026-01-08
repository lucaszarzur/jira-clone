import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Permission {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
}

export enum ProjectRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  // Listar todas as permissões de um projeto
  getProjectPermissions(projectId: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions/project/${projectId}`);
  }

  // Adicionar usuário ao projeto
  addUserToProject(projectId: string, userId: string, role: ProjectRole): Observable<Permission> {
    return this.http.post<Permission>(
      `${this.baseUrl}/permissions/project/${projectId}/user/${userId}?role=${role}`,
      {}
    );
  }

  // Atualizar permissão de um usuário
  updateUserPermission(projectId: string, userId: string, role: ProjectRole): Observable<Permission> {
    return this.http.put<Permission>(
      `${this.baseUrl}/permissions/project/${projectId}/user/${userId}`,
      { role }
    );
  }

  // Remover usuário do projeto
  removeUserFromProject(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/permissions/project/${projectId}/user/${userId}`
    );
  }
}
