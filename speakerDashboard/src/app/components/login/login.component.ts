import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
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
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.loginError = false;
      this.login(); // Call the login method
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  login(): void {
    const loginData = this.loginForm.value; // Get form values

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        localStorage.setItem('access_token', response.access_token);

        const uuid = this.authService.getUserUuid(response.access_token);
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loginError = true;
        this.errorMessage = 'Email ou mot de passe incorrect.';
        this.isSubmitting = false;
      },
    });
  }

  forgotPassword(): void {
    alert('Password reset functionality would be implemented here.');
  }
}
