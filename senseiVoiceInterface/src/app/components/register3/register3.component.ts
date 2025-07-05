import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register3',
  templateUrl: './register3.component.html',
  styleUrls: ['./register3.component.css']
})
export class Register3Component implements OnInit {
  signupForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  signupSuccess = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-]+$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return pass && confirmPass && pass !== confirmPass ? { passwordMismatch: true } : null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
  if (this.signupForm.invalid) {
    Object.values(this.signupForm.controls).forEach(control => control.markAsTouched());
    return;
  }

  this.isSubmitting = true;

  const fullName = `CLIENT ${this.signupForm.value.firstName.trim()} ${this.signupForm.value.lastName.trim()}`;

  const payload = {
    fullName: fullName,
    companyName: this.signupForm.value.companyName,
    email: this.signupForm.value.email,
    phone: this.signupForm.value.phone,
    password: this.signupForm.value.password,
  };

  this.http.post(`${environment.apiUrl}/api/speakersInfo/register`, payload).subscribe({
    next: () => {
      this.signupSuccess = true;
      this.isSubmitting = false;
    },
    error: (err) => {
      console.error('Signup error:', err);
      this.isSubmitting = false;
      // Show error message if you want
    }
  });
}

}
