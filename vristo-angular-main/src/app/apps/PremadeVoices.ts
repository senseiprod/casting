import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AudioService } from '../service/audio.service';
import { environment } from 'src/environments/environment';

interface SharedVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  language: string;
  locale?: string;
  accent?: string;
  gender?: string;
  age?: string;
  use_case?: string;
  description?: string;
  category?: string;
  labels?: {
    accent: string;
    language: string;
    descriptive: string;
    gender: string;
    age: string;
    use_case: string;
    locale?: string;
  };
  isPlaying?: boolean; // To track play state
  isLoading?: boolean; // To show loading state
}

@Component({
  selector: 'app-shared-voices',
  templateUrl: './PremadeVoices.html',

   // Make sure you have this file for the styles
})
export class SharedVoicesComponent implements OnInit, OnDestroy {
    private baseUrl = environment.apiUrl;
  languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'it', name: 'Italian' },
    { code: 'es', name: 'Spanish' }
  ];

  // Store the click handler as a class property
private clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

  selectedUseCase = 'all';
showUseCaseSelector = false;
useCaseSearchQuery = '';
  selectedLanguage = 'all';
  selectedGender = 'all';
  selectedAge = 'all';
  searchQuery = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Add this array of all use cases
useCases = [
    'narrative_story',
    'conversational',
    'informative_educational',
    'social_media',
    'entertainment_tv',
    'advertisement',
    'characters_animation',
    'news',
    'characters',
    'meditation',
    'audiobook',
    'ASMR',
    'animation'
  ];


  allVoices: SharedVoice[] = [];
  filteredVoices: SharedVoice[] = [];
  sharedVoices: SharedVoice[] = [];

  loading = false;
  selectedVoice: SharedVoice | null = null;
  synthesizeForm: FormGroup;
  showSynthesizeForm = false;

  // Audio playback control
  currentAudio: HTMLAudioElement | null = null;
  currentPlayingVoiceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private audioService: AudioService
  ) {
    this.synthesizeForm = this.fb.group({
      text: ['', Validators.required],
      output_format: ['mp3_44100_128'],
      stability: [0.5],
      similarity_boost: [0.75],
      style_guidance: [0.5],
      use_speaker_boost: [true]
    });
  }

  ngOnInit(): void {
    this.fetchAllVoices();
  }

  ngOnDestroy(): void {
    // Clean up any audio when component is destroyed
    this.stopAudio();

    // Clean up the click handler
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
}



// Getter for filtered use cases
get filteredUseCases(): string[] {
    if (!this.useCaseSearchQuery) {
      return this.useCases;
    }

    const query = this.useCaseSearchQuery.toLowerCase();
    return this.useCases.filter(useCase =>
      this.formatUseCase(useCase).toLowerCase().includes(query)
    );
  }

  // Format use case string for display
formatUseCase(useCase: string): string {
    if (useCase === 'all') return 'All Use Cases';

    // Replace underscores with spaces and capitalize each word
    return useCase
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Toggle the use case selector popup

  toggleUseCaseSelector(): void {
    this.showUseCaseSelector = !this.showUseCaseSelector;

    // Clear any existing handler first
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }

    // Reset search when opening
    if (this.showUseCaseSelector) {
      this.useCaseSearchQuery = '';

      // Define the handler and store it as a class property
      this.clickOutsideHandler = (event: MouseEvent) => {
        const useCasePopover = document.querySelector('.use-case-popover');
        const useCaseButton = document.querySelector('.custom-input-group');

        // Make sure we're not clicking on the popover or the button
        if (useCasePopover && !useCasePopover.contains(event.target as Node) &&
            useCaseButton && !useCaseButton.contains(event.target as Node)) {
          this.showUseCaseSelector = false;
          // Remove the handler
          document.removeEventListener('click', this.clickOutsideHandler!);
          this.clickOutsideHandler = null;
        }
      };

      // Add the click listener with a slight delay
      setTimeout(() => {
        document.addEventListener('click', this.clickOutsideHandler!);
      }, 100);
    }
  }

  // Modify the selectUseCase method to clean up the handler
selectUseCase(useCase: string, event: MouseEvent): void {
    this.selectedUseCase = useCase;
    // Prevent the event from bubbling up to the document click handler
    event.stopPropagation();
    this.showUseCaseSelector = false;

    // Clean up the click handler when manually selecting an option
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }

    this.applyFilters();
  }








  fetchAllVoices(): void {
    this.loading = true;
    this.http.get<any>(`${this.baseUrl}/api/elevenlabs/voices?page_size=100`)
      .subscribe(
        (response) => {
          if (response && response.voices) {
            this.allVoices = response.voices.map((voice: any) => {
              const fineTuningLanguage = voice.fine_tuning?.language;
              const labelsLanguage = voice.labels?.language;
              const directLanguage = voice.language;

              const language = fineTuningLanguage || labelsLanguage || directLanguage || '';

              return {
                voice_id: voice.voice_id,
                name: voice.name,
                preview_url: voice.preview_url,
                language: language,
                locale: voice.locale || voice.labels?.locale,
                category: voice.category,
                gender: voice.gender || (voice.labels ? voice.labels.gender : ''),
                accent: voice.accent || (voice.labels ? voice.labels.accent : ''),
                age: voice.age || (voice.labels ? voice.labels.age : ''),
                use_case: voice.use_case || (voice.labels ? voice.labels.use_case : ''),
                description: voice.description || '',
                isPlaying: false, // Initialize play state
                isLoading: false, // Initialize loading state
                labels: voice.labels || {
                  gender: voice.gender || '',
                  accent: voice.accent || '',
                  age: voice.age || '',
                  use_case: voice.use_case || '',
                  language: language
                }
              };
            });
            this.applyFilters();
          } else {
            this.allVoices = [];
            this.filteredVoices = [];
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching shared voices:', error);
          this.toastr.error('Failed to fetch shared voices.');
          this.loading = false;
          this.allVoices = [];
          this.filteredVoices = [];
          this.totalItems = 0;
        }
      );
  }

  // Filter methods remain the same as before
  applyFilters(): void {
    // Your existing filter logic
    let result = [...this.allVoices];

    if (this.selectedLanguage !== 'all') {
      result = result.filter(voice => {
        if (voice.language && voice.language.toLowerCase().includes(this.selectedLanguage.toLowerCase())) {
          return true;
        }
        if (voice.labels?.language && voice.labels.language.toLowerCase().includes(this.selectedLanguage.toLowerCase())) {
          return true;
        }
        return false;
      });
    }

    if (this.selectedGender !== 'all') {
      result = result.filter(voice => {
        const genderValue = voice.gender || voice.labels?.gender || '';
        return genderValue.toLowerCase() === this.selectedGender.toLowerCase();
      });
    }

    // Add the age filter
  if (this.selectedAge !== 'all') {
    result = result.filter(voice => {
      const ageValue = voice.age || voice.labels?.age || '';
      return ageValue.toLowerCase() === this.selectedAge.toLowerCase();
    });
  }

  // Add use case filter
  if (this.selectedUseCase !== 'all') {
    result = result.filter(voice => {
      const useCaseValue = voice.use_case || voice.labels?.use_case || '';
      return useCaseValue.toLowerCase() === this.selectedUseCase.toLowerCase();
    });
  }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(voice => {
        return (
          (voice.name && voice.name.toLowerCase().includes(query)) ||
          (voice.accent && voice.accent.toLowerCase().includes(query)) ||
          (voice.description && voice.description.toLowerCase().includes(query)) ||
          (voice.use_case && voice.use_case.toLowerCase().includes(query))||
          (voice.use_case && voice.use_case.toLowerCase().includes(query))
        );
      });
    }

    this.filteredVoices = result;
    this.sharedVoices = result;
    this.totalItems = result.length;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.selectedLanguage = 'all';
    this.selectedGender = 'all';
    this.selectedAge= 'all';
    this.selectedUseCase = 'all';
    this.searchQuery = '';
    this.applyFilters();
    this.toastr.info('All filters have been reset');
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage = language;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;

    // Stop any currently playing audio when changing pages
    this.stopAudio();
  }

  get paginatedVoices(): SharedVoice[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredVoices.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onSynthesizeClick(voice: SharedVoice): void {
    this.selectedVoice = voice;
    this.showSynthesizeForm = true;

    this.synthesizeForm.patchValue({
      text: '',
      output_format: 'mp3_44100_128',
      stability: 0.5,
      similarity_boost: 0.75,
      style_guidance: 0.5,
      use_speaker_boost: true
    });

    setTimeout(() => {
      const formElement = document.getElementById('synthesize-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // Enhanced audio control method
  togglePlayPreview(voice: SharedVoice): void {
    if (!voice.preview_url) {
      this.toastr.error('No preview available for this voice');
      return;
    }

    // If this voice is currently playing
    if (this.currentPlayingVoiceId === voice.voice_id && this.currentAudio) {
      if (this.currentAudio.paused) {
        // Resume playback
        this.currentAudio.play()
          .then(() => {
            voice.isPlaying = true;
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            this.toastr.error('Failed to play audio preview');
            voice.isPlaying = false;
          });
      } else {
        // Pause playback
        this.currentAudio.pause();
        voice.isPlaying = false;
      }
    } else {
      // Different voice or first play - stop any currently playing audio
      this.stopAudio();

      // Set loading state
      voice.isLoading = true;

      // Create new audio element
      this.currentAudio = new Audio(voice.preview_url);
      this.currentPlayingVoiceId = voice.voice_id;

      // Set up event listeners
      this.currentAudio.oncanplaythrough = () => {
        voice.isLoading = false;
      };

      this.currentAudio.onplay = () => {
        voice.isPlaying = true;
        voice.isLoading = false;
      };

      this.currentAudio.onpause = () => {
        voice.isPlaying = false;
      };

      this.currentAudio.onended = () => {
        voice.isPlaying = false;
        this.currentAudio = null;
        this.currentPlayingVoiceId = null;
      };

      this.currentAudio.onerror = () => {
        voice.isPlaying = false;
        voice.isLoading = false;
        this.toastr.error('Failed to load audio preview');
        this.currentAudio = null;
        this.currentPlayingVoiceId = null;
      };

      // Start loading and playing
      this.currentAudio.load();
      this.currentAudio.play()
        .then(() => {
          // Play started successfully
        })
        .catch(err => {
          console.error('Error playing audio:', err);
          voice.isLoading = false;
          voice.isPlaying = false;
          this.toastr.error('Failed to play audio preview');
        });
    }
  }




  // Helper to stop any playing audio
  private stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;

      // Reset play state for the previously playing voice
      if (this.currentPlayingVoiceId) {
        const playingVoice = this.findVoiceById(this.currentPlayingVoiceId);
        if (playingVoice) {
          playingVoice.isPlaying = false;
          playingVoice.isLoading = false;
        }
      }

      this.currentAudio = null;
      this.currentPlayingVoiceId = null;
    }
  }

  // Helper to find a voice by ID across all voice arrays
  private findVoiceById(voiceId: string): SharedVoice | undefined {
    return this.allVoices.find(v => v.voice_id === voiceId);
  }

  synthesizeSpeech(): void {
    // Your existing synthesize method
    if (!this.selectedVoice) {
      this.toastr.error('Please select a voice first.');
      return;
    }

    if (this.synthesizeForm.invalid) {
      this.toastr.error('Please fill out all required fields.');
      return;
    }

    const formValues = this.synthesizeForm.value;

    const requestBody = {
      text: formValues.text || '',
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: formValues.stability ? parseFloat(formValues.stability) : 0.5,
        similarity_boost: formValues.similarity_boost ? parseFloat(formValues.similarity_boost) : 0.75,
        style: formValues.style_guidance ? parseFloat(formValues.style_guidance) : 0.5,
        use_speaker_boost: formValues.use_speaker_boost !== undefined ? formValues.use_speaker_boost : true
      }
    };

    const outputFormat = formValues.output_format || 'mp3_44100_128';
    const enableLogging = true;
    const optimizeStreamingLatency = 0;

    const apiUrl = `${this.baseUrl}/api/elevenlabs/text-to-speech/${this.selectedVoice.voice_id}?output_format=${outputFormat}&enable_logging=${enableLogging}&optimize_streaming_latency=${optimizeStreamingLatency}`;

    this.http.post(apiUrl, requestBody, { responseType: 'arraybuffer' }).subscribe(
      (response: ArrayBuffer) => {
        const blob = new Blob([response], { type: this.getContentType(outputFormat) });

        const audioElement = document.createElement('audio');
        audioElement.src = URL.createObjectURL(blob);
        audioElement.controls = true;
        audioElement.style.width = '100%';
        audioElement.classList.add('custom-audio-player');

        const audioContainer = document.getElementById('shared-audio-container');
        if (audioContainer) {
          audioContainer.innerHTML = '';
          audioContainer.appendChild(audioElement);
        }

        this.toastr.success('Speech synthesized successfully!');
      },
      error => {
        console.error('Synthesis Error:', error);
        this.toastr.error('Failed to synthesize speech.');
      }
    );
  }

  private getContentType(outputFormat: string): string {
    if (outputFormat.startsWith('mp3')) {
      return 'audio/mp3';
    } else if (outputFormat.startsWith('pcm')) {
      return 'audio/wav';
    } else if (outputFormat.startsWith('ogg')) {
      return 'audio/ogg';
    } else {
      return 'audio/mp3'; // Default
    }
  }

  // Legacy method - redirect to toggle method
  playPreview(previewUrl: string): void {
    // Find the voice with this URL
    const voice = this.allVoices.find(v => v.preview_url === previewUrl);
    if (voice) {
      this.togglePlayPreview(voice);
    }
  }
}
