import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar token de autenticação apenas para requisições à nossa API
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    const token = this.authService.token;

    if (isApiUrl && token) {
      console.log('Adding JWT token to request:', request.url);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else if (isApiUrl) {
      console.log('No token available for request:', request.url);
    }

    return next.handle(request);
  }
}
