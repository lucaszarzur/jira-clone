import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JPermission, PermissionRole } from '@trungk18/interface/permission';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  // Get all permissions for a project
  getProjectPermissions(projectId: string): Observable<JPermission[]> {
    return this.http.get<JPermission[]>(`${this.baseUrl}/permissions/project/${projectId}`);
  }

  // Get user permission for a project
  getUserProjectPermission(projectId: string, userId: string): Observable<JPermission> {
    return this.http.get<JPermission>(`${this.baseUrl}/permissions/project/${projectId}/user/${userId}`);
  }

  // Update user permission for a project
  updateUserProjectPermission(projectId: string, userId: string, role: PermissionRole): Observable<JPermission> {
    return this.http.put<JPermission>(
      `${this.baseUrl}/permissions/project/${projectId}/user/${userId}`,
      { role }
    );
  }

  // Remove user permission from a project
  removeUserProjectPermission(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/permissions/project/${projectId}/user/${userId}`);
  }
}
