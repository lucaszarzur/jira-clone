import { JIssue } from './issue';
import { JUser } from './user';
import { PermissionRole } from './permission';

export interface JProject {
  id: string;
  name: string;
  url: string;
  description: string;
  category: ProjectCategory;
  isPublic: boolean;
  createdAt: string;
  updateAt: string;
  issues: JIssue[];
  users: JUser[];
  userRole?: PermissionRole;
}

// eslint-disable-next-line no-shadow
export enum ProjectCategory {
  SOFTWARE = 'Software',
  MARKETING = 'Marketing',
  BUSINESS = 'Business'
}
