import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { JProject } from '@trungk18/interface/project';
import { JIssue } from '@trungk18/interface/issue';
import { JUser } from '@trungk18/interface/user';

export interface ProjectState {
  project: JProject;
  projects: JProject[];
  issues: JIssue[];
  users: JUser[];
  loading: boolean;
  error: any;
}

const initialState: ProjectState = {
  project: null,
  projects: [],
  issues: [],
  users: [],
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({
  name: 'project'
})
export class ProjectStore extends Store<ProjectState> {
  constructor() {
    super(initialState);
  }
}
