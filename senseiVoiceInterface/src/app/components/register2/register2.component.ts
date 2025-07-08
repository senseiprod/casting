import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
    personal: true,
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

  // This will hold the actual file object for submission
  private selectedAudioFile: File | null = null;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Form group definition remains the same
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      artistName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthdate: ['', Validators.required],
      location: ['', Validators.required],
      currentJob: ['', Validators.required],
      experienceYears: ['', [Validators.required, Validators.min(0)]],
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
      demoFile: [''], // Control is used for display and validation UI, but not sent directly
      hasStudio: ['', Validators.required],
      studioDescription: [''],
      professionalExperience: ['', Validators.required],
      socialLinks: [''],
      voiceCloningConsent: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
      digitalSignature: ['', Validators.required],
      signatureDate: ['', Validators.required],
    });

    const today = new Date().toISOString().split('T')[0];
    this.signupForm.patchValue({ signatureDate: today });

    this.signupForm.get('hasStudio')?.valueChanges.subscribe(value => {
      const studioDescControl = this.signupForm.get('studioDescription');
      if (value === 'yes') {
        studioDescControl?.setValidators(Validators.required);
      } else {
        studioDescControl?.clearValidators();
      }
      studioDescControl?.updateValueAndValidity();
    });
  }

  toggleSection(sectionKey: string): void {
    this.expandedSections[sectionKey] = !this.expandedSections[sectionKey];
  }

  getCompletedSectionsCount(): number {
    // This logic does not need to change
    let count = 0;
    if (this.signupForm.get('fullName')?.valid && this.signupForm.get('email')?.valid && this.signupForm.get('phone')?.valid && this.signupForm.get('birthdate')?.valid && this.signupForm.get('location')?.valid) count++;
    if (this.signupForm.get('currentJob')?.valid && this.signupForm.get('experienceYears')?.valid) count++;
    if (this.signupForm.get('langArabicClassical')?.value || this.signupForm.get('langDarija')?.value || this.signupForm.get('langFrench')?.value || this.signupForm.get('langEnglish')?.value || this.signupForm.get('langSpanish')?.value || this.signupForm.get('otherLanguages')?.value) count++;
    if (this.signupForm.get('voiceFemale')?.value || this.signupForm.get('voiceMale')?.value || this.signupForm.get('voiceTeenChild')?.value || this.signupForm.get('voiceSenior')?.value || this.signupForm.get('voiceNeutral')?.value || this.signupForm.get('voiceDeep')?.value || this.signupForm.get('voiceDynamic')?.value || this.signupForm.get('voiceOther')?.value) count++;
    if (this.signupForm.get('demoLink')?.value || this.signupForm.get('demoFile')?.value) count++;
    if (this.signupForm.get('hasStudio')?.valid) count++;
    if (this.signupForm.get('professionalExperience')?.valid) count++;
    if (this.signupForm.get('socialLinks')?.value) count++;
    if (this.signupForm.get('voiceCloningConsent')?.valid) count++;
    if (this.signupForm.get('digitalSignature')?.valid && this.signupForm.get('signatureDate')?.valid) count++;
    return count;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!['audio/mpeg', 'audio/wav'].includes(file.type)) {
        this.fileError = 'Seuls les fichiers MP3 ou WAV sont acceptés.';
        this.selectedAudioFile = null;
        this.signupForm.patchValue({ demoFile: null });
        (event.target as HTMLInputElement).value = '';
      } else if (file.size > 10 * 1024 * 1024) { // 10 MB
        this.fileError = 'Le fichier ne doit pas dépasser 10 Mo.';
        this.selectedAudioFile = null;
        this.signupForm.patchValue({ demoFile: null });
        (event.target as HTMLInputElement).value = '';
      } else {
        this.fileError = '';
        // Store the actual file object for later submission
        this.selectedAudioFile = file;
        this.signupForm.patchValue({ demoFile: file.name });
      }
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      console.error('Form is invalid. Please fill all required fields.');
      const firstInvalidControl = document.querySelector('form .ng-invalid');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.isSubmitting = true;

    // Use FormData to send both the file and the form's JSON data
    const formData = new FormData();

    // 1. Get the form data and prepare it as a JSON object
    const speakerData = this.signupForm.value;
    delete speakerData.demoFile; // We don't need the filename in the JSON part
    speakerData.fullName = `SPEAKER ${speakerData.fullName}`;

    // 2. Append the JSON data as a Blob. The backend's @RequestPart("speakerData") expects this key.
    formData.append('speakerData', new Blob([JSON.stringify(speakerData)], {
        type: 'application/json'
    }));

    // 3. Append the audio file if one was selected. The backend's @RequestPart("audioFile") expects this key.
    if (this.selectedAudioFile) {
        formData.append('audioFile', this.selectedAudioFile, this.selectedAudioFile.name);
    }

    const finalUrl = `${environment.apiUrl}/api/speakersInfo/register`;

    // 4. Send the FormData object. DO NOT set the Content-Type header manually.
    // The browser will handle setting it to 'multipart/form-data' with the correct boundary.
    this.http.post(finalUrl, formData).subscribe({
      next: (response) => {
        console.log('Speaker registered successfully:', response);
        this.signupSuccess = true;
        this.isSubmitting = false;
        const successElement = document.getElementById('successMessage');
        if (successElement) {
          successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      error: (error) => {
        console.error('Error registering speaker:', error);
        this.isSubmitting = false;
        const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again later.';
        alert(`Registration Failed: ${errorMessage}`);
      }
    });
  }
}