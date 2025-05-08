import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Permission {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
}

@Component({
  selector: 'app-project-permissions',
  templateUrl: './project-permissions.component.html',
  styleUrls: ['./project-permissions.component.scss']
})
export class ProjectPermissionsComponent implements OnInit {
  permissions: Permission[] = [];
  isLoading = false;
  isAddingUser = false;
  addUserForm: FormGroup;
  projectId: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private message: NzMessageService
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['member', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.http.get<Permission[]>(`${environment.apiUrl}/permissions/project/${this.projectId}`)
      .subscribe(
        permissions => {
          this.permissions = permissions;
          this.isLoading = false;
        },
        error => {
          this.message.error('Failed to load permissions: ' + (error.error?.message || 'Unknown error'));
          this.isLoading = false;
        }
      );
  }

  addUser(): void {
    if (this.addUserForm.invalid) {
      Object.values(this.addUserForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isAddingUser = true;
    const { email, role } = this.addUserForm.value;

    this.http.post(`${environment.apiUrl}/projects/${this.projectId}/users`, { email, role })
      .subscribe(
        () => {
          this.message.success('User added successfully');
          this.isAddingUser = false;
          this.addUserForm.reset({ role: 'member' });
          this.loadPermissions();
        },
        error => {
          this.message.error('Failed to add user: ' + (error.error?.message || 'Unknown error'));
          this.isAddingUser = false;
        }
      );
  }

  updateUserRole(userId: string, role: string): void {
    this.http.put(`${environment.apiUrl}/permissions/project/${this.projectId}/user/${userId}`, { role })
      .subscribe(
        () => {
          this.message.success('User role updated successfully');
          this.loadPermissions();
        },
        error => {
          this.message.error('Failed to update user role: ' + (error.error?.message || 'Unknown error'));
        }
      );
  }

  removeUser(userId: string): void {
    this.http.delete(`${environment.apiUrl}/permissions/project/${this.projectId}/user/${userId}`)
      .subscribe(
        () => {
          this.message.success('User removed successfully');
          this.loadPermissions();
        },
        error => {
          this.message.error('Failed to remove user: ' + (error.error?.message || 'Unknown error'));
        }
      );
  }
} 