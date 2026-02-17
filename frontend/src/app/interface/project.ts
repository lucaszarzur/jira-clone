import { JIssue } from './issue';
import { JUser } from './user';

export interface JProject {
  id: string;
  key: string;
  name: string;
  url: string;
  description: string;
  category: ProjectCategory;
  createdAt: string;
  updateAt: string;
  issues: JIssue[];
  users: JUser[];
  userRole?: string;
}

// eslint-disable-next-line no-shadow
export enum ProjectCategory {
  SOFTWARE = 'Software',
  MARKETING = 'Marketing',
  BUSINESS = 'Business'
}
