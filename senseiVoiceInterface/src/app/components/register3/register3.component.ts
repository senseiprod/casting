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
      companyName: [''], // Optional
      email: ['', [Validators.required, Validators.email]],
      // This line is already correct. It has a pattern validator but does not require a value.
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

    const formValue = this.signupForm.value;

    const speakerData = {
      // 1. Map fields from this form
      fullName: `CLIENT ${formValue.firstName.trim()} ${formValue.lastName.trim()}`,
      email: formValue.email,
      // --- FIX: If phone is an empty string, send null instead. ---
      phone: formValue.phone || null,
      agreeTerms: formValue.agreeTerms,
      artistName: formValue.companyName,

      // Dummy data for required fields
      birthdate: '1900-01-01',
      location: 'Not Specified',
      
      // Default values for other fields
      currentJob: 'Client',
      experienceYears: 0,
      langArabicClassical: false,
      langDarija: false,
      langFrench: false,
      langEnglish: false,
      langSpanish: false,
      otherLanguages: '',
      voiceFemale: false,
      voiceMale: false,
      voiceTeenChild: false,
      voiceSenior: false,
      voiceNeutral: false,
      voiceDeep: false,
      voiceDynamic: false,
      voiceOther: '',
      demoLink: '',
      hasStudio: 'no',
      studioDescription: '',
      professionalExperience: '',
      socialLinks: '',
      voiceCloningConsent: 'no',
      digitalSignature: `${formValue.firstName.trim()} ${formValue.lastName.trim()}`,
      signatureDate: new Date().toISOString().split('T')[0],
    };

    const formData = new FormData();
    formData.append('speakerData', new Blob([JSON.stringify(speakerData)], {
        type: 'application/json'
    }));

    this.http.post(`${environment.apiUrl}/api/speakersInfo/register`, formData).subscribe({
      next: () => {
        this.signupSuccess = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Signup error:', err);
        alert(`Registration failed: ${err.error?.message || 'Please try again later.'}`);
        this.isSubmitting = false;
      }
    });
  }
}