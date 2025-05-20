import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SpeakerResponse, SpeakerService } from "../../../services/speaker-service.service";
import { AudioResponse, AudioService, TypeAudio } from "../../../services/audio.service";
import { VoixResponse, VoixService } from "../../../services/voix.service";
import { UtilisateurService } from "../../../services/utilisateur-service.service";
import { Location } from '@angular/common';

export interface Language {
  name: string;
  code: string;
  proficiency: number; // 1-5 scale
  flag: string;
}

export interface VoiceSample {
  id: number;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  category: string;
  audioBlob?: Blob;
}

export interface Pricing {
  hourlyRate: number;
  currency: string;
  minimumProject: number;
  discountPackages: boolean;
}

@Component({
  selector: 'app-speaker-details',
  templateUrl: './speaker-details.component.html',
  styleUrls: ['./speaker-details.component.css']
})
export class SpeakerDetailsComponent implements OnInit {
  // This is the object that will be used in the template
  speaker: any = {
    name: '',
    title: '',
    avatar: '',
    biography: '',
    rating: 0,
    projectsCompleted: 0,
    clientSatisfaction: 0,
    responseTime: '',
    languages: [],
    specialties: [],
    samples: [],
    pricing: {
      hourlyRate: 0,
      currency: '€',
      minimumProject: 0,
      discountPackages: false
    }
  };

  // Original API data
  speakerData: SpeakerResponse;
  speakerUuid: string;
  currentSample: VoiceSample | null = null;
  isPlaying: boolean = false;
  activeTab: string = 'samples';
  audioPlayer: HTMLAudioElement | null = null;
  loading: boolean = true;
  error: string | null = null;

  // Audio progress tracking
  currentTime: string = '0:00';
  progressPercent: number = 0;
  volumePercent: number = 80;

  constructor(
    private route: ActivatedRoute,
    private speakerService: SpeakerService,
    private audioService: AudioService,
    private voixService: VoixService,
    private utilisateurService: UtilisateurService,
    private location: Location // Add this
  ) {}

  ngOnInit(): void {
    // Get the speaker UUID from the route parameters
    this.route.params.subscribe(params => {
      this.speakerUuid = params['uuid'];
      if (this.speakerUuid) {
        this.loadSpeakerDetails();
      } else {
        this.error = "Speaker UUID not provided";
        this.loading = false;
      }
    });
  }
  goBackToSpeakers(): void {
    this.location.back();
  }
  loadSpeakerDetails(): void {
    this.loading = true;

    // Get speaker details
    this.speakerService.getSpeakerByUuid(this.speakerUuid).subscribe(
      (data) => {
        this.speakerData = data;

        // Map API data to the template's expected structure
        this.mapSpeakerData();

        // Load speaker photo
        this.loadSpeakerPhoto();

        // Load audio samples
        this.loadAudioSamples();

        this.loading = false;
      },
      (error) => {
        console.error('Error loading speaker details:', error);
        this.error = "Failed to load speaker details";
        this.loading = false;
      }
    );
  }

  mapSpeakerData(): void {
    // Map the SpeakerResponse data to the format expected by the template
    this.speaker.name = `${this.speakerData.prenom} ${this.speakerData.nom}`;
    this.speaker.title = this.speakerData.role || 'Narrateur Professionnel';

    // Set default values for fields not in the API
    this.speaker.biography = 'Biographie professionnelle du narrateur.';
    this.speaker.rating = 4.5; // Default rating
    this.speaker.projectsCompleted = 0; // Will be updated if available
    this.speaker.clientSatisfaction = 95; // Default satisfaction
    this.speaker.responseTime = '< 24 heures'; // Default response time

    // Set default specialties
    this.speaker.specialties = [
      'Narration documentaire',
      'Publicité',
      'E-learning',
      'Message d\'accueil'
    ];

    // Set default pricing
    this.speaker.pricing = {
      hourlyRate: this.speakerData.earnings || 100,
      currency: '€',
      minimumProject: 50,
      discountPackages: true
    };

    // Map languages (will be updated in loadLanguages if available)
    this.speaker.languages = [{
      name: this.speakerData.username || 'Français',
      code: 'fr',
      proficiency: 5,
      flag: 'france'
    }];
  }

  loadSpeakerPhoto(): void {
    this.utilisateurService.getPhoto(this.speakerUuid).subscribe(
      (response) => {
        const reader = new FileReader();
        reader.readAsDataURL(response);
        reader.onload = () => {
          this.speaker.avatar = reader.result as string;
        };
      },
      (error) => {
        console.error(`Error loading photo for speaker ${this.speakerUuid}:`, error);
        this.speaker.avatar = "assets/img/avatar men.png"; // Fallback image
      }
    );
  }

  loadAudioSamples(): void {
    // Get all audio samples for this speaker
    this.audioService.getAllAudiosBySpeaker(this.speakerUuid).subscribe(
      (audioResponses) => {
        // Convert audio responses to VoiceSample format
        this.speaker.samples = audioResponses.map((audio, index) => {
          // Create a blob from the audio file
          const audioBlob = new Blob([audio.audioFile], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);

          return {
            id: index + 1,
            title: audio.title || `Échantillon ${index + 1}`,
            description: audio.description || `Échantillon audio ${index + 1}`,
            duration: this.formatDuration(audio.duration || 30),
            audioUrl: audioUrl,
            category: audio.typeAudio === TypeAudio.ORIGINAL ? 'Original' : 'Clone',
            audioBlob: audioBlob
          };
        });

        // Set the first sample as current if available
        if (this.speaker.samples.length > 0) {
          this.currentSample = this.speaker.samples[0];
        }
      },
      (error) => {
        console.error(`Error loading audio samples for speaker ${this.speakerUuid}:`, error);
        // Add some default samples if API fails
        this.speaker.samples = [
          {
            id: 1,
            title: 'Échantillon par défaut',
            description: 'Échantillon audio par défaut',
            duration: '0:30',
            audioUrl: '',
            category: 'Échantillon'
          }
        ];
      }
    );
  }

  // Helper method to format duration in seconds to MM:SS format
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  playSample(sample: VoiceSample): void {
    // Stop current audio if playing
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }

    this.currentSample = sample;
    this.audioPlayer = new Audio(sample.audioUrl);

    // Set up audio progress tracking
    this.audioPlayer.addEventListener('timeupdate', () => {
      if (this.audioPlayer) {
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;
        this.progressPercent = (currentTime / duration) * 100;
        this.currentTime = this.formatDuration(currentTime);
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = Array(5).fill(0);

    for (let i = 0; i < fullStars; i++) {
      stars[i] = 1; // Full star
    }

    if (hasHalfStar && fullStars < 5) {
      stars[fullStars] = 0.5; // Half star
    }

    return stars;
  }

  getProficiencyLevel(level: number): string {
    return Array(level).fill('●').join(' ');
  }

  contactSpeaker(): void {
    console.log('Contact speaker form would open');
    // Contact form logic would go here
  }

  hireSpeaker(): void {
    console.log('Hire speaker process would start');
    // Hire process logic would go here
  }

  // Clean up resources when component is destroyed
  ngOnDestroy(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }

    // Revoke any object URLs to prevent memory leaks
    if (this.speaker.samples) {
      this.speaker.samples.forEach(sample => {
        if (sample.audioUrl && sample.audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(sample.audioUrl);
        }
      });
    }
  }
}
