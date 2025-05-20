import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UsersService } from '../service/users.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router,  private usersService: UsersService ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('access_token');

        if (token) {
            // Decode the token to check role and other details
            try {
                const decodedToken = this.decodeToken(token);

                // Check if the token has expired
                if (this.isTokenExpired(decodedToken)) {
                    this.handleTokenExpiration();
                    return throwError('Token has expired');
                }

                // Check if the user has the required role (in this case, 'ADMIN')
                if (!this.hasAdminRole(decodedToken)) {
                    // Redirect to unauthorized page or show error
                    this.router.navigate(['/unauthorized']);
                    return throwError('Insufficient permissions');
                }

                // Clone the request and add the Authorization header
                const clonedRequest = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Forward the cloned request
                return next.handle(clonedRequest).pipe(
                    catchError(this.handleError.bind(this))
                );
            } catch (error) {
                // Handle token decoding errors
                this.handleTokenExpiration();
                return throwError('Invalid token');
            }
        }

        return next.handle(req);
    }

    private decodeToken(token: string): any {
        try {
            // Decode the JWT token payload (middle part)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(atob(base64));
        } catch (error) {
            throw new Error('Token decoding failed');
        }
    }

    private isTokenExpired(decodedToken: any): boolean {
        if (!decodedToken.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }

    private hasAdminRole(decodedToken: any): Observable<boolean> {
        const userId = decodedToken.uuid || null;
        console.log(decodedToken);

        if (!userId) {
          return of(false); // If no UUID is found, return false immediately
        }

        return this.usersService.fetchUserById(userId).pipe(
          map(user => user.role === 'ADMIN'),
          catchError(error => {
            console.error('Error fetching user:', error);
            return of(false); // Return false in case of error
          })
        );
      }


    private handleTokenExpiration() {
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Redirect to login page
        this.router.navigate(['/auth/cover-login']);
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 401) {
            // Unauthorized - token might be invalid
            this.handleTokenExpiration();
        } else if (error.status === 403) {
            // Forbidden - insufficient permissions
            this.router.navigate(['/unauthorized']);
        }

        // Rethrow the error
        return throwError(error);
    }
}
