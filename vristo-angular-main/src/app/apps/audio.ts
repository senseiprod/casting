import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../app/service/audio.service';
import { toggleAnimation } from 'src/app/shared/animations';

@Component({
  selector: 'app-save-audio',
  templateUrl: 'audio.html',
  animations: [toggleAnimation],
})
export class AudioComponent implements OnInit {
// Add this method to handle audio play/pause
togglePlay(audioElement: HTMLAudioElement): void {
    const progressBar = audioElement.nextElementSibling?.querySelector('.progress-bar') as HTMLElement;
    const timeDisplay = audioElement.nextElementSibling?.querySelector('.audio-time') as HTMLElement;
    const playButton = audioElement.nextElementSibling?.querySelector('.btn-play i') as HTMLElement;

    if (audioElement.paused) {
      audioElement.play();
      playButton.classList.remove('bi-play-fill');
      playButton.classList.add('bi-pause-fill');

      // Update progress bar and time
      const updateProgress = () => {
        const percentage = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = `${percentage}%`;

        // Format time
        const minutes = Math.floor(audioElement.currentTime / 60);
        const seconds = Math.floor(audioElement.currentTime % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      audioElement.addEventListener('timeupdate', updateProgress);
      audioElement.addEventListener('ended', () => {
        playButton.classList.remove('bi-pause-fill');
        playButton.classList.add('bi-play-fill');
        progressBar.style.width = '0%';
        timeDisplay.textContent = '0:00';
      });
    } else {
      audioElement.pause();
      playButton.classList.remove('bi-pause-fill');
      playButton.classList.add('bi-play-fill');
    }
  }
onFileDrop($event: DragEvent) {
throw new Error('Method not implemented.');
}
clearFile() {
throw new Error('Method not implemented.');
}
  speakers: any[] = [];
  selectedSpeakerId: string | null = null;
  audioFile: File | null = null;
  voiceName: string = '';
  selectedSpeakerName: string = '';
  audios: any[] = [];
  isLoading: boolean = true;
  isSubmitting: boolean = false;

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
        this.audios = data.filter(audio => audio.typeAudio === 'ORIGINAL');
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
