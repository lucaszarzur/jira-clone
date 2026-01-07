import { ProjectComponent } from '@trungk18/project/project.component';
import { of } from 'rxjs';


describe('ProjectComponent', () => {
  let component: ProjectComponent;

  const route: any = { snapshot: { params: {} } };
  const projectQuery: any = { selectActive: () => of(null) };
  const projectService: any = {};

  beforeEach(() => {
    component = new ProjectComponent(
      route,
      projectQuery,
      projectService
    );
  });

  it('should be able to toggle', () => {
    component.expanded = false;
    component.manualToggle();
    expect(component.expanded).toBe(true);
  });
});
