import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  signupSuccess = false;
  signupError = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      companyName: ['',[Validators.required]], // facultatif ? à ajuster
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-]+$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]],
    }, {
      validators: this.passwordMatchValidator,
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      this.signupError = false;

      const formData = {
        firstname: this.signupForm.value.firstName,
        lastname: this.signupForm.value.lastName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        companyName:this.signupForm.value.companyName,
        phone:this.signupForm.value.phone,
        role: 'CLIENT', // ou dynamique si besoin
      };

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('Inscription réussie:', response);
          localStorage.setItem('access_token', response.access_token);
          this.signupSuccess = true;
          this.router.navigate(['/speakerDasboard/generate']);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.signupError = true;
          this.errorMessage = 'Une erreur est survenue lors de l’inscription.';
          this.isSubmitting = false;
        },
      });
    } else {
      Object.keys(this.signupForm.controls).forEach((key) => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  getPasswordStrength(): { strength: string; color: string } {
    const password = this.signupForm.get('password')?.value || '';
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3) return { strength: 'Faible', color: '#dc3545' };
    if (score < 5) return { strength: 'Moyenne', color: '#ffc107' };
    return { strength: 'Forte', color: '#28a745' };
  }
}
