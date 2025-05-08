import { JUser } from './user';

export type PermissionRole = 'admin' | 'member' | 'viewer';

export interface JPermission {
  id: string;
  userId: string;
  projectId: string;
  role: PermissionRole;
  createdAt?: string;
  updatedAt?: string;
  user?: JUser;
}
