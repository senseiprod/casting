import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { SpeakerProfileService } from '../../../services/speaker-profile.service';
import { SpeakerProfileResponse } from '../../../models/speaker-profile.model';

interface TabConfig {
  id: string;
  label: string;
  iconPath: string;
  count?: number;
}

@Component({
  selector: 'app-speaker-details',
  templateUrl: './speaker-details.component.html',
  styleUrls: ['./speaker-details.component.css']
})
export class SpeakerDetailsComponent implements OnInit, OnDestroy {
  speakerProfile: SpeakerProfileResponse | null = null;
  speakerUuid: string = '';
  loading: boolean = true;
  error: string | null = null;

  // Audio player state
  currentSample: any = null;
  isPlaying: boolean = false;
  audioPlayer: HTMLAudioElement | null = null;
  currentTime: string = '0:00';
  totalTime: string = '0:00';
  progressPercent: number = 0;
  volumePercent: number = 80;
  isMuted: boolean = false;

  // UI state
  activeTab: string = 'samples';
  selectedAudioType: string = '';
  filteredAudios: any[] = [];

  // Tab configuration
  tabs: TabConfig[] = [
    {
      id: 'samples',
      label: 'Échantillons',
      iconPath: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
    },
    {
      id: 'voices',
      label: 'Voix',
      iconPath: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z'
    },
    {
      id: 'about',
      label: 'Profil',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
    },
    {
      id: 'analytics',
      label: 'Statistiques',
      iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private speakerProfileService: SpeakerProfileService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.speakerUuid = params['uuid'];
      if (this.speakerUuid) {
        this.loadSpeakerDetails();
      } else {
        this.error = "UUID du narrateur non fourni";
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupAudio();
  }

  loadSpeakerDetails(): void {
    this.loading = true;
    this.error = null;

    this.speakerProfileService.getSpeakerProfileWithStatistics(this.speakerUuid).subscribe({
      next: (profile) => {
        this.speakerProfile = profile;
        this.filteredAudios = profile.audios || [];
        this.updateTabCounts();
        this.loading = false;

        // Set first audio as current sample if available
        if (this.filteredAudios.length > 0) {
          this.currentSample = this.filteredAudios[0];
        }
      },
      error: (error) => {
        console.error('Error loading speaker profile:', error);
        this.error = "Impossible de charger le profil du narrateur";
        this.loading = false;
      }
    });
  }

  updateTabCounts(): void {
    if (this.speakerProfile) {
      this.tabs.forEach(tab => {
        switch (tab.id) {
          case 'samples':
            tab.count = this.speakerProfile!.audios?.length || 0;
            break;
          case 'voices':
            tab.count = this.speakerProfile!.voix?.length || 0;
            break;
        }
      });
    }
  }

  // Audio Management
  selectAudio(audio: any): void {
    this.currentSample = audio;
    if (this.isPlaying) {
      this.pauseSample();
    }
  }

  playSample(sample: any): void {
    if (!sample.audioFile) {
      console.error('No audio file available');
      return;
    }

    this.cleanupAudio();

    // Create blob from audio file data
    const audioBlob = new Blob([sample.audioFile], { type: `audio/${sample.format || 'mp3'}` });
    const audioUrl = URL.createObjectURL(audioBlob);

    this.audioPlayer = new Audio(audioUrl);
    this.audioPlayer.volume = this.volumePercent / 100;

    // Set up event listeners
    this.audioPlayer.addEventListener('loadedmetadata', () => {
      if (this.audioPlayer) {
        this.totalTime = this.formatTime(this.audioPlayer.duration);
      }
    });

    this.audioPlayer.addEventListener('timeupdate', () => {
      if (this.audioPlayer) {
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;
        this.progressPercent = (currentTime / duration) * 100;
        this.currentTime = this.formatTime(currentTime);
      }
    });

    this.audioPlayer.addEventListener('ended', () => {
      this.isPlaying = false;
      this.progressPercent = 0;
      this.currentTime = '0:00';
    });

    this.audioPlayer.play().then(() => {
      this.isPlaying = true;
    }).catch(error => {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    });
  }

  pauseSample(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.isPlaying = false;
    }
  }

  seekAudio(event: MouseEvent): void {
    if (!this.audioPlayer) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    this.audioPlayer.currentTime = percentage * this.audioPlayer.duration;
  }

  setVolume(event: MouseEvent): void {
    const volumeSlider = event.currentTarget as HTMLElement;
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    this.volumePercent = Math.max(0, Math.min(100, (clickX / width) * 100));
    
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volumePercent / 100;
    }
    this.isMuted = this.volumePercent === 0;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.isMuted ? 0 : this.volumePercent / 100;
    }
  }

  downloadAudio(audio: any): void {
    if (!audio.audioFile) return;

    const blob = new Blob([audio.audioFile], { type: `audio/${audio.format || 'mp3'}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audio.title || 'audio'}.${audio.format || 'mp3'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private cleanupAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
    this.isPlaying = false;
  }

  // UI Management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  filterAudios(): void {
    if (!this.speakerProfile?.audios) return;

    this.filteredAudios = this.selectedAudioType 
      ? this.speakerProfile.audios.filter(audio => audio.typeAudio === this.selectedAudioType)
      : this.speakerProfile.audios;
  }

  // Utility Methods
  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = Array(5).fill(0);

    for (let i = 0; i < fullStars; i++) {
      stars[i] = 1;
    }

    if (hasHalfStar && fullStars < 5) {
      stars[fullStars] = 0.5;
    }

    return stars;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return 'N/A';
    
    if (bytes < 1024) return bytes + ' B';
    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    const units = ['B', 'KB', 'MB', 'GB'];
    return (bytes / Math.pow(1024, exp)).toFixed(1) + ' ' + units[exp];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getFlagClass(languageCode: string): string {
    const flagMap: { [key: string]: string } = {
      'fr': 'france',
      'en': 'uk',
      'es': 'spain',
      'de': 'germany',
      'it': 'italy',
      'pt': 'portugal',
      'ar': 'saudi-arabia',
      'ary': 'morocco',
      'zh': 'china',
      'ja': 'japan',
      'ko': 'south-korea',
      'ru': 'russia',
      'hi': 'india',
      'tr': 'turkey',
      'nl': 'netherlands'
    };
    return flagMap[languageCode] || 'default';
  }

  getCompletionPercentage(): number {
    if (!this.speakerProfile) return 0;
    
    let completionScore = 0;
    const totalFields = 10;

    if (this.speakerProfile.nom) completionScore++;
    if (this.speakerProfile.prenom) completionScore++;
    if (this.speakerProfile.email) completionScore++;
    if (this.speakerProfile.phone) completionScore++;
    if (this.speakerProfile.age) completionScore++;
    if (this.speakerProfile.gender) completionScore++;
    if (this.speakerProfile.banckRib) completionScore++;
    if (this.speakerProfile.languages?.length) completionScore++;
    if (this.speakerProfile.voix?.length) completionScore++;
    if (this.speakerProfile.audios?.length) completionScore++;

    return Math.round((completionScore / totalFields) * 100);
  }

  getCompletionDescription(status: string | undefined): string {
    const descMap: { [key: string]: string } = {
      'INCOMPLETE': 'Le profil nécessite plus d\'informations',
      'BASIC': 'Les informations de base sont complètes',
      'COMPLETE': 'Toutes les informations sont renseignées',
      'VERIFIED': 'Profil vérifié et validé'
    };
    return descMap[status || 'INCOMPLETE'] || 'Description non disponible';
  }

  // Actions
  contactSpeaker(): void {
    // Implement contact functionality
    console.log('Contact speaker:', this.speakerProfile?.uuid);
  }

  hireSpeaker(): void {
    // Implement hire functionality
    console.log('Hire speaker:', this.speakerProfile?.uuid);
  }

  goBackToSpeakers(): void {
    this.location.back();
  }
}
