import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth`; // Replace with your backend URL
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  signIn(email: string, password: string): Observable<any> {
    const authRequest = { email, password };

    return this.http.post(`${this.apiUrl}/authenticate`, authRequest).pipe(
      tap((response: any) => {
        // Check if a JWT token is returned
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('user', JSON.stringify(response.userUuid));
          this.currentUserSubject.next(response.userUuid);
          this.router.navigate(['/auth/cover-login']); // ✅ Update BehaviorSubject correctly
        }
      })
    );
  }

  private isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return true; // No token, so consider it expired
    }

    // Decode the token to get the expiration time
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decodedToken.exp * 1000; // Convert expiration time to milliseconds
    const currentTime = new Date().getTime();

    return currentTime > expirationTime;
  }




  refreshToken(): Observable<any> {
    // Get the current access token stored in localStorage
    const currentToken = localStorage.getItem('access_token');

    // If there's no token, we don't need to refresh
    if (!currentToken) {
      return throwError('No access token found');
    }

    // Send a POST request to refresh the token
    return this.http.post(`${this.apiUrl}/refresh-token`, null, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${currentToken}`)
    }).pipe(
      tap((response: any) => {
        if (response.token) {
          // Store the new JWT token
          localStorage.setItem('access_token', response.token);
        }
      })
    );
  }


  getUserData(): Observable<any> {
    // Get the access token from localStorage
    const token = localStorage.getItem('access_token');

    // If no token is found, return an error
    if (!token) {
      return throwError('No token found');
    }

    // Include the token in the request header
    return this.http.get(`${this.apiUrl}/user-data`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    });
  }




  signUp(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/signin']);
  }

  getUserProfile(): Observable<any> {
    let userId = localStorage.getItem('user'); // Get user ID from localStorage

    if (!userId) {
      return throwError('User ID not found in local storage');
    }

    userId = userId.replace(/^"|"$/g, '');


    console.log(userId);
    // Remove surrounding quotes if they exist

    return this.http.get<any>(`http://localhost:8080/utilisateurs/${userId}`);
}

}
