import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthQuery } from './auth.query';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicProjectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private authQuery: AuthQuery,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Get the project ID from the route
    const projectId = route.paramMap.get('id');

    if (!projectId) {
      // If no project ID, allow access to the default route
      return true;
    }

    console.log('Checking project access for ID:', projectId);

    // Check if the project is public
    return this.http.get<any>(`${environment.apiUrl}/projects/${projectId}`).pipe(
      map(project => {
        console.log('Project data:', project);

        if (project && project.isPublic) {
          console.log('Project is public, allowing access');
          // Project is public, allow access
          return true;
        } else {
          console.log('Project is not public, checking authentication');
          // Project is not public, check if user is authenticated
          const token = this.authService.getToken();

          if (!token) {
            console.log('No token, redirecting to login');
            // No token, redirect to login
            this.router.navigate(['/login']);
            return false;
          }

          console.log('Has token, checking current user');
          // Has token, allow access and let the backend handle permissions
          return true;
        }
      }),
      catchError(error => {
        console.error('Error checking project:', error);
        // Error getting project, redirect to home
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}
