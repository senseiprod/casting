import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {jwtDecode} from "jwt-decode";
import {ClientResponse, ClientService} from "./client-service.service";
import { environment } from 'src/environments/environment';


interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
}

interface AuthenticationRequest {
  email: string;
  password: string;
}

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth`;
  client : ClientResponse =new ClientResponse();

  constructor(private http: HttpClient,private userService : ClientService) {}
  private tokenKey = '';

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/register`, request);
  }

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request).pipe(
      tap((response: AuthenticationResponse) => {
        // Store the token in localStorage and set it to tokenKey
        localStorage.setItem(this.tokenKey, response.access_token);
      })
    );
  }
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  requestPasswordReset(email: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/request-reset-password`, { email });
  }

  /**
   * Reset password using token and new password
   */
  resetPassword(token: string, newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, {
      token,
      newPassword
    });
  }
  getUsername(token: string): string | null {
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.sub : null;
  }
  getUserConnect(): Observable<ClientResponse> {
    const uuid = this.getUserUuid(localStorage.getItem(this.tokenKey));
    return this.userService.getClientByUuid(uuid);
  }
  getUserUuid(token: string): string | null {
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.uuid : null;
  }

  getExpirationTime(token: string): number | null {
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.exp : null;
  }

  isTokenExpired(token: string): boolean {
    const expirationTime = this.getExpirationTime(token);
    if (expirationTime) {
      return ((1000 * expirationTime) - (new Date()).getTime()) < 5000;
    }
    return true;
  }
  getAccessToken():  string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.clear()
  }
}
