import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../app/service/audio.service';
import { toggleAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-save-audio',
  templateUrl: 'genaudio.html',
  animations: [toggleAnimation],
})
export class GenAudioComponent implements OnInit {
  speakers: any[] = [];
  selectedSpeakerId: string | null = null;
  audioFile: File | null = null;
  voiceName: string = '';
  selectedSpeakerName: string = '';
  audios: any[] = [];
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  playingAudio: HTMLAudioElement | null = null;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.loadSpeakers();
    this.loadAudios();
  }

  loadSpeakers(): void {
    this.audioService.getSpeakers().subscribe({
      next: (data) => {
        this.speakers = data;
        console.log('Speakers loaded:', this.speakers);
      },
      error: (error) => {
        console.error('Error fetching speakers:', error);
      }
    });
  }

  loadAudios(): void {
    this.isLoading = true;
    this.audioService.getAllAudios().subscribe({
      next: (data) => {
        // Filter only audios with typeAudio === 'GENERATED'
        this.audios = data.filter(audio => audio.typeAudio === 'GENERATED');
        console.log('Filtered Audios (Only GENERATED):', this.audios);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching audios:', error);
        this.isLoading = false;
      }
    });
  }

  convertBytesToAudioUrl(byteData: string): string {
    const binaryString = atob(byteData);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Implement the togglePlay method
  togglePlay(audioElement: HTMLAudioElement): void {
    if (this.playingAudio && this.playingAudio !== audioElement) {
      // If another audio is playing, pause it first
      this.playingAudio.pause();
      this.playingAudio.currentTime = 0;
    }

    if (audioElement.paused) {
      audioElement.play();
      this.playingAudio = audioElement;
    } else {
      audioElement.pause();
      this.playingAudio = null;
    }
  }

  // Implement the onFileDrop method
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.audioFile = event.dataTransfer.files[0];
      console.log('File dropped:', this.audioFile.name);
    }
  }

  // Implement the clearFile method
  clearFile(): void {
    this.audioFile = null;
    const fileInput = document.getElementById('audioFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Improved speaker selection handler
  onSpeakerSelect(event: any): void {
    const selectedName = event.target.value;
    this.selectedSpeakerName = selectedName;
    console.log('Selected speaker name:', selectedName);

    // Find the speaker object directly from the loaded speakers array
    const selectedSpeaker = this.speakers.find(speaker => speaker.nom === selectedName);

    if (selectedSpeaker) {
      // Use the speaker's UUID directly
      this.selectedSpeakerId = selectedSpeaker.speakerUuid || selectedSpeaker.uuid;
      console.log('Selected speaker ID:', this.selectedSpeakerId);
    } else {
      console.error('Selected speaker not found in speakers array');
      this.selectedSpeakerId = null;
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.audioFile = event.target.files[0];
      console.log('File selected:', this.audioFile ? this.audioFile.name : 'No file selected');
    } else {
      this.audioFile = null;
    }
  }

  // Improved form submission
  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Form data:', {
      audioFile: this.audioFile ? this.audioFile.name : 'No file',
      voiceName: this.voiceName,
      speakerId: this.selectedSpeakerId
    });

    // Validation check
    if (!this.audioFile) {
      console.error('No audio file selected');
      return;
    }
    if (!this.voiceName) {
      console.error('No voice name provided');
      return;
    }
    if (!this.selectedSpeakerId) {
      console.error('No speaker selected');
      return;
    }

    this.isSubmitting = true;

    this.audioService.uploadAudio(this.audioFile, this.voiceName, this.selectedSpeakerId)
      .subscribe({
        next: (response) => {
          console.log('Audio uploaded successfully:', response);
          this.isSubmitting = false;

          // Reset form after successful upload
          this.resetForm();

          // Reload the audios to show the new one
          this.loadAudios();
        },
        error: (error) => {
          console.error('Error uploading audio:', error);
          this.isSubmitting = false;
        }
      });
  }

  // Add this method to reset the form
  resetForm(): void {
    this.audioFile = null;
    this.voiceName = '';
    this.selectedSpeakerId = null;
    this.selectedSpeakerName = '';

    // Reset the file input
    const fileInput = document.getElementById('audioFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
