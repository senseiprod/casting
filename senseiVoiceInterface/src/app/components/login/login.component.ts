import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
// --- ADDED --- Import ActivatedRoute to read parameters from the URL
import { ActivatedRoute, Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  loginError = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    // --- ADDED --- Inject the ActivatedRoute service
    private route: ActivatedRoute, 
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // --- MODIFIED --- This method now contains the core logic for handling the OAuth2 redirect
  ngOnInit(): void {
    // Check the URL's query parameters when the component loads
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      const uuid = params['uuid']; // The backend sends the UUID too
      const error = params['error'];

      // Case 1: Successful OAuth login - tokens are in the URL
      if (token && refreshToken && uuid) {
        console.log('OAuth callback detected with tokens. Storing and redirecting.');
        
        // Use the AuthService to store the tokens in localStorage
        this.authService.storeOauthTokens(token, refreshToken);
        
        // Navigate to the user's dashboard, similar to the regular login flow.
        // The 'replaceUrl: true' option cleans the tokens from the browser's address bar.
        this.router.navigate(['/speakerDasboard/', uuid], { replaceUrl: true });
      } 
      // Case 2: Failed OAuth login - an error is in the URL
      else if (error) {
        console.error('OAuth callback detected with an error:', error);
        this.loginError = true;
        this.errorMessage = 'Login with Google failed. Please try again.';
        
        // Optional: Clean the error from the URL so it doesn't persist on refresh
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { error: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.loginError = false;
      this.login();
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  login(): void {
    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        // The service now handles storing the token, so this line can be removed, but leaving it is harmless.
        localStorage.setItem('access_token', response.access_token);

        const uuid = this.authService.getUserUuid(response.access_token);
        // Navigate to dashboard using the UUID from the token
        this.router.navigate(['/speakerDasboard/', uuid]);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loginError = true;
        this.errorMessage = 'Email ou mot de passe incorrect.';
        this.isSubmitting = false;
      },
    });
  }

  // --- ADDED --- This method is called by the new "Sign in with Google" button
  signInWithGoogle(): void {
    this.isSubmitting = true; // Give user feedback that an action has started
    this.authService.loginWithGoogle();
  }

  forgotPassword(): void {
    alert('Password reset functionality would be implemented here.');
  }

  navigateToSignup(): void {
    this.router.navigate(["/signup3"])
  }
}