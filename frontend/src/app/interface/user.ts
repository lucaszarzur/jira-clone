export interface JUser {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  avatarUrl: string;
  createdAt?: string;
  updatedAt?: string;
  issueIds?: string[];
  token?: string;
}
