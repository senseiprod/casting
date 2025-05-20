import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UtilisateurService, UtilisateurRequest } from '../../services/utilisateur.service';
import { VoixService, Voix2Response } from '../../services/voix.service';
import { SpeakerResponse } from '../../services/speaker.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userInfo: SpeakerResponse = null;
  userVoices: Voix2Response[] = [];
  profilePhotoUrl: SafeUrl | null = null;
  selectedFile: File | null = null;
  isEditMode = false;
  isLoading = true;
  selectedVoice: Voix2Response | null = null;
  audioPlaying: { [key: string]: boolean } = {};
  audioElement: HTMLAudioElement | null = null;
  currentPlayingId: string | null = null;
  currentUserUuid = '';


  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private voixService: VoixService,
    private sanitizer: DomSanitizer,
    private authservice: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.authservice.getUserConnect().subscribe((response)=>{
      this.userInfo = response;
      this.profileForm.patchValue({
        nom: response.nom,
        prenom: response.prenom,
        email: response.email,
        phone: response.phone
      });
      this.loadUserPhoto(response.uuid);
      this.loadUserVoices(response.uuid);
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }


  loadUserPhoto(userId: string): void {
    this.utilisateurService.getPhoto(userId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (error) => {
        console.error('Error loading user photo:', error);
        // Set default photo
        this.profilePhotoUrl = 'assets/images/default-profile.png';
      }
    });
  }

  loadUserVoices(speakerUuid: string): void {
    this.voixService.getAllVoicesBySpeaker(speakerUuid).subscribe({
      next: (voices) => {
        this.userVoices = voices;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user voices:', error);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadPhoto(): void {
    if (this.selectedFile && this.userInfo) {
      const userId = this.userInfo.uuid;
      this.utilisateurService.uploadPhoto(userId, this.selectedFile).subscribe({
        next: (response) => {
          console.log('Photo uploaded successfully:', response);
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Error uploading photo:', error);
        }
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.userInfo) {
      // Reset form to original values when canceling edit
      this.profileForm.patchValue({
        nom: this.userInfo.nom,
        prenom: this.userInfo.prenom,
        email: this.userInfo.email,
        phone: this.userInfo.phone
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.userInfo) {
      const updatedUser: UtilisateurRequest = {
        ...this.userInfo,
        nom: this.profileForm.value.nom,
        prenom: this.profileForm.value.prenom,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone
      };

      this.utilisateurService.updateUser(this.userInfo.uuid, updatedUser).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.isEditMode = false;

          // Upload photo if selected
          if (this.selectedFile) {
            this.uploadPhoto();
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  selectVoice(voice: Voix2Response): void {
    this.selectedVoice = voice;
  }

  playVoiceSample(voiceId: string): void {
    // Stop any currently playing audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    if (this.currentPlayingId) {
      this.audioPlaying[this.currentPlayingId] = false;
    }

    // Play the selected voice sample
    // This is a placeholder - you would need to implement the actual audio playback
    // based on how your backend provides voice samples
    this.audioPlaying[voiceId] = true;
    this.currentPlayingId = voiceId;

    // Simulate audio playback (replace with actual implementation)
    this.audioElement = new Audio(`http://localhost:8080/api/voix2/sample/${voiceId}`);
    this.audioElement.onended = () => {
      this.audioPlaying[voiceId] = false;
      this.currentPlayingId = null;
    };
    this.audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      this.audioPlaying[voiceId] = false;
    });
  }

  stopVoiceSample(): void {
    if (this.audioElement && this.currentPlayingId) {
      this.audioElement.pause();
      this.audioPlaying[this.currentPlayingId] = false;
      this.currentPlayingId = null;
    }
  }

  getVoiceTypeLabel(type: string): string {
    // Map voice types to user-friendly labels
    const typeMap: { [key: string]: string } = {
      'NATURAL': 'Natural',
      'CLONED': 'Cloned',
      'AI': 'AI Generated'
    };
    return typeMap[type] || type;
  }
}
