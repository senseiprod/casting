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

    // --- Create a payload that matches the full SpeakerInfo DTO ---
    const speakerData = {
      // 1. Map fields from this form
      fullName: `CLIENT ${formValue.firstName.trim()} ${formValue.lastName.trim()}`,
      email: formValue.email,
      phone: formValue.phone,
      agreeTerms: formValue.agreeTerms,
      artistName: formValue.companyName,

      // =================================================================
      // === FIX: Provide dummy data for fields that are required     ===
      // === by the backend but not present in this form.            ===
      // =================================================================
      birthdate: '1900-01-01', // A valid, non-null date string to pass @NotNull
      location: 'Not Specified',  // A non-blank string to pass @NotBlank
      // =================================================================

      // 2. Provide default values for all other non-required fields
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

    // 3. Use FormData because the endpoint consumes multipart/form-data
    const formData = new FormData();
    formData.append('speakerData', new Blob([JSON.stringify(speakerData)], {
        type: 'application/json'
    }));

    // 4. Send the request
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