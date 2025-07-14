import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { throwError } from "rxjs"
import { jwtDecode } from "jwt-decode";
import { ClientResponse, ClientService } from "./client-service.service";
import { environment } from 'src/environments/environment';
import { ChangePasswordRequest } from './utilisateur-service.service';

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  companyName: string;
  phone: string;
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
  // --- ADDED --- The base URL is needed for the OAuth endpoint which is not under /api/v1/auth
  private baseApiUrl = environment.apiUrl;

  client: ClientResponse = new ClientResponse();

  constructor(private http: HttpClient, private userService: ClientService) { }
  // --- MODIFIED --- Gave the key a consistent name.
  public tokenKey = 'access_token';
  // --- ADDED --- Key for the refresh token.
  public refreshTokenKey = 'refresh_token';


  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, request, { responseType: 'text' });
  }

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request).pipe(
      // --- MODIFIED --- Now stores both the access and refresh tokens from a standard login.
      tap((response: AuthenticationResponse) => {
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.refreshTokenKey, response.refresh_token);
      })
    );
  }

  // --- ADDED ---
  // This method redirects the browser to the backend's Google authorization URL.
  loginWithGoogle(): void {
    window.location.href = `${this.baseApiUrl}/oauth2/authorization/google`;
  }

  // --- ADDED ---
  // This method is called by the LoginComponent to save tokens from the URL after a successful OAuth redirect.
  storeOauthTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    console.log('OAuth tokens stored in localStorage.');
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  forgotPassword(email: string): Observable<string> {
    const request: ForgotPasswordRequest = { email }
    return this.http
      .post(`${this.apiUrl}/forgot-password`, request, {
        responseType: "text",
      })
      .pipe(
        catchError((error) => {
          console.error("Forgot password error:", error)
          return throwError(() => error)
        }),
      )
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    const request: ResetPasswordRequest = { token, newPassword }
    return this.http
      .post(`${this.apiUrl}/reset-password`, request, {
        responseType: "text",
      })
      .pipe(
        catchError((error) => {
          console.error("Reset password error:", error)
          return throwError(() => error)
        }),
      )
  }

  getUsername(token: string): string | null {
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.sub : null;
  }
  getUserConnect(): Observable<ClientResponse> {
    const uuid = this.getUserUuid(localStorage.getItem(this.tokenKey)!); // Added non-null assertion
    return this.userService.getClientByUuid(uuid!); // Added non-null assertion
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
  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    // --- MODIFIED --- Use removeItem for clarity and to avoid clearing everything.
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.put(`${this.apiUrl}/change-password`, request);
  }
}