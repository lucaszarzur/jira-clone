import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectQuery } from '../../state/project/project.query';
import { ProjectService } from '../../state/project/project.service';
import { JProject, ProjectCategory } from '@trungk18/interface/project';
import { ProjectConst } from '../../config/const';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NoWhitespaceValidator } from '@trungk18/core/validators/no-whitespace.validator';
import { PermissionService, Permission, ProjectRole } from '@trungk18/core/services/permission.service';
import { UserService, User } from '@trungk18/core/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  project$: Observable<JProject>;
  projectForm: FormGroup;
  categories: ProjectCategory[];
  breadcrumbs: string[];

  // Members management
  permissions: Permission[] = [];
  allUsers: User[] = [];
  availableUsers: User[] = [];
  selectedUserId: string | null = null;
  selectedRole: ProjectRole = ProjectRole.MEMBER;
  projectRoles = ProjectRole;
  isLoadingPermissions = false;
  currentProjectId: string | null = null;

  constructor(
    private projectQuery: ProjectQuery,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private fb: FormBuilder,
    private router: Router,
    private permissionService: PermissionService,
    private userService: UserService
  ) {
    this.project$ = this.projectQuery.selectActive();
    this.categories = [
      ProjectCategory.BUSINESS,
      ProjectCategory.MARKETING,
      ProjectCategory.SOFTWARE
    ];

    this.initForm();

    this.project$.pipe(
      tap(project => {
        if (project) {
          this.updateForm(project);
          this.breadcrumbs = [ProjectConst.Projects, project.name, 'Settings'];
          this.currentProjectId = project.id;
          this.loadPermissions(project.id);
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  initForm() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceValidator()]],
      description: [''],
      category: [''],
      isPublic: [true]
    });
  }

  private updateForm(project: JProject) {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      category: project.category,
      isPublic: project.isPublic ?? true
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      return;
    }

    const formValue = this.projectForm.value;

    this.project$.pipe(
      take(1),
      tap(project => {
        if (project) {
          const projectToUpdate: Partial<JProject> = {
            ...formValue,
            id: project.id
          };

          this.projectService.update(project.id, projectToUpdate).subscribe(
            () => {
              this.notification.success('Success', 'Project updated successfully');
              this.router.navigate(['/project', project.id]);
            },
            error => {
              this.notification.error('Error', 'Failed to update project');
            }
          );
        }
      })
    ).subscribe();
  }

  // Members management methods
  loadPermissions(projectId: string): void {
    this.isLoadingPermissions = true;
    this.permissionService.getProjectPermissions(projectId).subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.updateAvailableUsers();
        this.isLoadingPermissions = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.notification.error('Erro', 'Falha ao carregar membros do projeto');
        this.isLoadingPermissions = false;
      }
    });
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.updateAvailableUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  updateAvailableUsers(): void {
    const memberIds = this.permissions.map(p => p.userId);
    this.availableUsers = this.allUsers.filter(user => !memberIds.includes(user.id));
  }

  addMember(): void {
    if (!this.selectedUserId || !this.currentProjectId) {
      return;
    }

    this.permissionService.addUserToProject(
      this.currentProjectId,
      this.selectedUserId,
      this.selectedRole
    ).subscribe({
      next: (permission) => {
        this.permissions.push(permission);
        this.updateAvailableUsers();
        this.selectedUserId = null;
        this.selectedRole = ProjectRole.MEMBER;
        this.notification.success('Sucesso', 'Membro adicionado com sucesso');
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.notification.error('Erro', 'Falha ao adicionar membro');
      }
    });
  }

  updateMemberRole(permission: Permission, newRole: ProjectRole): void {
    if (!this.currentProjectId) {
      return;
    }

    this.permissionService.updateUserPermission(
      this.currentProjectId,
      permission.userId,
      newRole
    ).subscribe({
      next: (updatedPermission) => {
        const index = this.permissions.findIndex(p => p.id === permission.id);
        if (index !== -1) {
          this.permissions[index] = updatedPermission;
        }
        this.notification.success('Sucesso', 'Permissão atualizada com sucesso');
      },
      error: (error) => {
        console.error('Error updating permission:', error);
        this.notification.error('Erro', 'Falha ao atualizar permissão');
      }
    });
  }

  removeMember(permission: Permission): void {
    if (!this.currentProjectId) {
      return;
    }

    this.permissionService.removeUserFromProject(
      this.currentProjectId,
      permission.userId
    ).subscribe({
      next: () => {
        this.permissions = this.permissions.filter(p => p.id !== permission.id);
        this.updateAvailableUsers();
        this.notification.success('Sucesso', 'Membro removido com sucesso');
      },
      error: (error) => {
        console.error('Error removing member:', error);
        this.notification.error('Erro', 'Falha ao remover membro');
      }
    });
  }

  getRoleLabel(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.ADMIN:
        return 'Admin';
      case ProjectRole.MEMBER:
        return 'Membro';
      case ProjectRole.VIEWER:
        return 'Visualizador';
      default:
        return role;
    }
  }

  getRoleBadgeClass(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.ADMIN:
        return 'role-badge-admin';
      case ProjectRole.MEMBER:
        return 'role-badge-member';
      case ProjectRole.VIEWER:
        return 'role-badge-viewer';
      default:
        return '';
    }
  }
}
