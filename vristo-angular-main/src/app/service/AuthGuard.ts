import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('access_token');

    if (!token) {
      // No token found, redirect to login
      this.router.navigate(['/auth/cover-login']);
      return false;
    }

    try {
      // Try to decode the token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));

      // Check if the token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenPayload.exp < currentTime) {
        // Token has expired, clear storage and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/cover-login']);
        return false;
      }

      // Token is valid
      return true;
    } catch (error) {
      // Invalid token format, clear and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      this.router.navigate(['/auth/cover-login']);
      return false;
    }
  }
}
