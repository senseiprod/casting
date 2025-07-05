import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-register',
  templateUrl: './register2.component.html',
  styleUrls: ['./register2.component.css']
})
export class Register2Component implements OnInit {
  signupForm!: FormGroup;
  signupSuccess = false;
  isSubmitting = false;
  fileError = '';
  expandedSections: { [key: string]: boolean } = {
    personal: true, // First section expanded by default
    professional: false,
    languages: false,
    voiceType: false,
    demo: false,
    studio: false,
    experience: false,
    social: false,
    voiceCloning: false,
    documents: false,
    declaration: false
  };

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      fullName: [''],
      artistName: [''],
      email: [''],
      phone: [''],
      birthdate: [''],
      location: [''],
      currentJob: [''],
      experienceYears: [''],
      langArabicClassical: [false],
      langDarija: [false],
      langFrench: [false],
      langEnglish: [false],
      langSpanish: [false],
      otherLanguages: [''],
      voiceFemale: [false],
      voiceMale: [false],
      voiceTeenChild: [false],
      voiceSenior: [false],
      voiceNeutral: [false],
      voiceDeep: [false],
      voiceDynamic: [false],
      voiceOther: [''],
      demoLink: [''],
      demoFile: [''],
      hasStudio: [''], // Changed from boolean to string
      studioDescription: [''],
      professionalExperience: [''],
      socialLinks: [''],
      voiceCloningConsent: [''], // Changed from boolean to string
      agreeTerms: [false],
      digitalSignature: [''],
      signatureDate: [''],
    });

    // Set today's date as default for signature date
    const today = new Date().toISOString().split('T')[0];
    this.signupForm.patchValue({ signatureDate: today });

    // React to hasStudio to toggle studioDescription validator
    this.signupForm.get('hasStudio')?.valueChanges.subscribe(value => {
      if (value === 'yes') {
        this.signupForm.get('studioDescription')?.setValidators(Validators.required);
      } else {
        this.signupForm.get('studioDescription')?.clearValidators();
      }
      this.signupForm.get('studioDescription')?.updateValueAndValidity();
    });
  }

  toggleSection(sectionKey: string): void {
    this.expandedSections[sectionKey] = !this.expandedSections[sectionKey];
  }

  getCompletedSectionsCount(): number {
    let count = 0;
    
    // Personal section
    if (this.signupForm.get('fullName')?.value && 
        this.signupForm.get('email')?.value && 
        this.signupForm.get('phone')?.value &&
        this.signupForm.get('birthdate')?.value &&
        this.signupForm.get('location')?.value) count++;
    
    // Professional section
    if (this.signupForm.get('currentJob')?.value && 
        this.signupForm.get('experienceYears')?.value) count++;
    
    // Languages section
    if (this.signupForm.get('langArabicClassical')?.value || 
        this.signupForm.get('langDarija')?.value ||
        this.signupForm.get('langFrench')?.value ||
        this.signupForm.get('langEnglish')?.value ||
        this.signupForm.get('langSpanish')?.value ||
        this.signupForm.get('otherLanguages')?.value) count++;
    
    // Voice type section
    if (this.signupForm.get('voiceFemale')?.value || 
        this.signupForm.get('voiceMale')?.value ||
        this.signupForm.get('voiceTeenChild')?.value ||
        this.signupForm.get('voiceSenior')?.value ||
        this.signupForm.get('voiceNeutral')?.value ||
        this.signupForm.get('voiceDeep')?.value ||
        this.signupForm.get('voiceDynamic')?.value ||
        this.signupForm.get('voiceOther')?.value) count++;
    
    // Demo section
    if (this.signupForm.get('demoLink')?.value || 
        this.signupForm.get('demoFile')?.value) count++;
    
    // Studio section
    if (this.signupForm.get('hasStudio')?.value) count++;
    
    // Experience section
    if (this.signupForm.get('professionalExperience')?.value) count++;
    
    // Social section
    if (this.signupForm.get('socialLinks')?.value) count++;
    
    // Voice cloning section
    if (this.signupForm.get('voiceCloningConsent')?.value) count++;
    
    // Declaration section (always considered complete)
    count++;
    
    return count;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!['audio/mpeg', 'audio/wav'].includes(file.type)) {
        this.fileError = 'Seuls les fichiers MP3 ou WAV sont acceptés.';
        this.signupForm.patchValue({ demoFile: null });
      } else if (file.size > 10 * 1024 * 1024) {
        this.fileError = 'Le fichier ne doit pas dépasser 10 Mo.';
        this.signupForm.patchValue({ demoFile: null });
      } else {
        this.fileError = '';
        this.signupForm.patchValue({ demoFile: file.name });
      }
    }
  }

 onSubmit(): void {
  if (this.signupForm.invalid) {
    this.signupForm.markAllAsTouched();
    console.log('Form is invalid:', this.signupForm.errors);
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control && control.errors) {
        console.log(`${key} errors:`, control.errors);
      }
    });
    return;
  }

  this.isSubmitting = true;


  const fullNameWithPrefix = `SPEAKER ${this.signupForm.get('fullName')?.value}`;

  // Prepare payload with only the 4 required fields
  const payload = {
    fullName: fullNameWithPrefix,
    artistName: this.signupForm.get('artistName')?.value,
    email: this.signupForm.get('email')?.value,
    phone: this.signupForm.get('phone')?.value
  };

  // Send POST request to your backend endpoint
  this.http.post(`${environment.apiUrl}/api/speakersInfo/register`, payload).subscribe({
    next: (response) => {
      console.log('Speaker registered successfully:', response);
      this.signupSuccess = true;
      this.isSubmitting = false;

      // Scroll to success message
      const successElement = document.getElementById('successMessage');
      if (successElement) {
        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    error: (error) => {
      console.error('Error registering speaker:', error);
      this.isSubmitting = false;
      // You can also add error handling UI here
    }
  });
}

}