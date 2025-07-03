import { Component } from '@angular/core';
import {FavoriteVoicesDto, FavoriteVoicesService} from "../../../services/favorite-voices.service";
import {ElevenLabsService} from "../../../services/eleven-labs.service";
import {AuthService} from "../../../services/auth.service";
import {map} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import { LahajatiService } from "../../../services/lahajati.service";

interface Voice {
  id: string;
  name: string;
  description: string;
  language: string;
  flagCode: string;
  sampleUrl: string;
  preview_url?: string;
}

// Interface for Lahajati voices
interface LahajatiVoice {
  id: string
  name: string
  gender: string
  avatar?: string
  originalVoiceUrl?: string
  clonedVoiceUrl?: string
  price?: number
  type: string
  language: string
  ageZone?: string
  dialect?: string
  performanceStyle?: string
  description?: string
  preview_url?: string
  voice_id?: string
}

// Interface for Lahajati dialects
interface LahajatiDialect {
  id: string
  name: string
  description?: string
}

// Interface for Lahajati performance styles
interface LahajatiPerformanceStyle {
  id: string
  name: string
  description?: string
}

export interface Language {
  code: string;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-list-with-slected-language',
  templateUrl: './list-with-slected-language.component.html',
  styleUrls: ['./list-with-slected-language.component.css']
})
export class ListWithSlectedLanguageComponent {
  languages = [
    { code: "darija", name: "Darija", active: false }, // Added Darija
    { code: "ar", name: "Arabe", active: false },
    { code: "fr", name: "Français", active: false },
    { code: "en", name: "Anglais", active: true },
    { code: 'de', name: 'Allemand', active: false },
    { code: 'es', name: 'Espagnol', active: false },
    { code: 'tr', name: 'Turc', active: false },
    { code: 'it', name: 'Italien', active: false },
    { code: 'pt', name: 'Portugais', active: false },
    { code: 'hi', name: 'Hindi', active: false },
    { code: 'bn', name: 'Bengali', active: false },
    { code: 'ru', name: 'Russe', active: false },
    { code: 'ja', name: 'Japonais', active: false },
    { code: 'ko', name: 'Coréen', active: false },
    { code: 'zh', name: 'Chinois', active: false },
    { code: 'vi', name: 'Vietnamien', active: false },
    { code: 'pl', name: 'Polonais', active: false },
    { code: 'uk', name: 'Ukrainien', active: false },
    { code: 'ro', name: 'Roumain', active: false },
    { code: 'nl', name: 'Néerlandais', active: false },
    { code: 'sv', name: 'Suédois', active: false },
    { code: 'fi', name: 'Finnois', active: false },
    { code: 'no', name: 'Norvégien', active: false },
    { code: 'da', name: 'Danois', active: false },
    { code: 'hu', name: 'Hongrois', active: false },
    { code: 'cs', name: 'Tchèque', active: false },
    { code: 'el', name: 'Grec', active: false },
    { code: 'th', name: 'Thaï', active: false },
    { code: 'id', name: 'Indonésien', active: false },
    { code: 'ms', name: 'Malais', active: false },
    { code: 'he', name: 'Hébreu', active: false },
    { code: 'fa', name: 'Persan', active: false }
  ];

  // Lahajati-specific properties
  lahajatiVoices: LahajatiVoice[] = []
  lahajatiDialects: any[] = []
  lahajatiPerformanceStyles: any[] = []
  selectedDialect = ""
  selectedPerformanceStyle = ""
  isLoadingLahajatiData = false
  lahajatiDataLoaded = false

  // Filter options
  accents = [
    { code: '', name: 'Tous les accents', active: true },
    { code: 'American', name: 'Américain', active: false },
    { code: 'British', name: 'Britannique', active: false },
    { code: 'Australian', name: 'Australien', active: false },
    { code: 'Indian', name: 'Indien', active: false },
    { code: 'African', name: 'Africain', active: false },
    { code: 'French', name: 'Français', active: false },
    { code: 'German', name: 'Allemand', active: false },
    { code: 'Spanish', name: 'Espagnol', active: false }
  ];

  ages = [
    { code: '', name: 'Tous les âges', active: true },
    { code: 'young', name: 'Jeune', active: false },
    { code: 'middle-aged', name: 'Moyen', active: false },
    { code: 'old', name: 'Âgé', active: false }
  ];

  genders = [
    { code: '', name: 'Tous les genres', active: true },
    { code: 'male', name: 'Homme', active: false },
    { code: 'female', name: 'Femme', active: false },
  ];

  categories = [
    { code: '', name: 'Toutes les catégories', active: true },
    { code: 'professional', name: 'Professionnel', active: false },
    { code: 'casual', name: 'Décontracté', active: false },
    { code: 'character', name: 'Personnage', active: false },
    { code: 'storytelling', name: 'Narration', active: false }
  ];

  // Existing properties
  voices: any[] = [];
  allVoices: any[] = []; // Store all voices for filtering
  pageSizeOptions: number[] = [10, 20, 50, 100];
  pageSize: number = 10;
  currentPageIndex: number = 1;
  totalVoices: number = 0;
  hasMorePages: boolean = false;
  isLoading: boolean = true;
  currentPlayingVoiceId: string | null = null;
  uuid: string = '';
  currentAudio: HTMLAudioElement | null = null;

  // Filter selections
  selectedLanguage: string = '';
  selectedAccent: string = '';
  selectedAge: string = '';
  selectedGender: string = '';
  selectedCategory: string = '';

  // Favorites
  favoriteVoices: FavoriteVoicesDto[] = [];
  showFavoritesOnly: boolean = false;

  constructor(
    private favoriteVoicesService: FavoriteVoicesService,
    private route: ActivatedRoute,
    private voiceService: ElevenLabsService,
    private authService: AuthService,
    private lahajatiService: LahajatiService // Added Lahajati service
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedLanguage = params['language'];
      
      // If Darija is selected, load Lahajati data
      if (this.selectedLanguage === 'darija') {
        this.fetchLahajatiData();
      }
    });
    
    this.authService.getUserConnect().subscribe((data) => {
      this.uuid = data.uuid;
      this.loadFavoriteVoices();
      this.loadVoices();
    });
  }

  // New method to fetch Lahajati data
  fetchLahajatiData() {
    if (this.lahajatiDataLoaded || this.isLoadingLahajatiData) {
      return
    }

    this.isLoadingLahajatiData = true
    console.log("Fetching Lahajati voices and dialects...")

    // Fetch voices, dialects, and performance styles in parallel
    Promise.all([
      this.lahajatiService.getVoices(1, 50).toPromise(),
      this.lahajatiService.getDialects(1, 50).toPromise(),
      this.lahajatiService.getPerformanceStyles(1, 50).toPromise(),
    ])
      .then(([voicesResponse, dialectsResponse, stylesResponse]) => {
        try {
          // Parse voices
          if (voicesResponse) {
            const voicesData = JSON.parse(voicesResponse)
            this.lahajatiVoices = this.mapLahajatiVoices(voicesData.data || voicesData)
            console.log("Lahajati voices loaded:", this.lahajatiVoices)
          }

          // Parse dialects
          if (dialectsResponse) {
            const dialectsData = JSON.parse(dialectsResponse)
            this.lahajatiDialects = dialectsData.data || dialectsData
            console.log("Lahajati dialects loaded:", this.lahajatiDialects)
          }

          // Parse performance styles
          if (stylesResponse) {
            const stylesData = JSON.parse(stylesResponse)
            this.lahajatiPerformanceStyles = stylesData.data || stylesData
            console.log("Lahajati performance styles loaded:", this.lahajatiPerformanceStyles)
          }

          this.lahajatiDataLoaded = true
          this.isLoadingLahajatiData = false

          // Update voices if Darija is currently selected
          if (this.selectedLanguage === "darija") {
            this.applyDarijaVoices()
          }
        } catch (error) {
          console.error("Error parsing Lahajati data:", error)
          this.isLoadingLahajatiData = false
        }
      })
      .catch((error) => {
        console.error("Error fetching Lahajati data:", error)
        this.isLoadingLahajatiData = false
      })
  }

  // Map Lahajati voices to match the existing Voice interface
  mapLahajatiVoices(lahajatiVoices: any[]): LahajatiVoice[] {
    return lahajatiVoices.map((voice) => ({
      id: voice.id_voice || voice.voice_id,
      voice_id: voice.id_voice || voice.voice_id,
      name: voice.display_name || voice.voice_name,
      gender: voice.gender || "unknown",
      avatar: voice.avatar || voice.image || "/assets/default-avatar.png",
      originalVoiceUrl: voice.sample_url || voice.preview_url,
      clonedVoiceUrl: voice.sample_url || voice.preview_url,
      preview_url: voice.sample_url || voice.preview_url,
      price: voice.price || 0.05,
      type: "darija",
      language: "darija",
      ageZone: voice.age_zone || voice.age || "adult",
      dialect: voice.dialect,
      performanceStyle: voice.performance_style,
      description: voice.description || `Voix Darija ${voice.gender || ''} ${voice.dialect || ''}`.trim(),
      labels: {
        gender: voice.gender || "unknown",
        age: voice.age_zone || voice.age || "adult"
      },
      category: "darija",
      fine_tuning: {
        language: "darija"
      }
    }))
  }

  // Apply Darija voices to the current voice list
  applyDarijaVoices() {
    if (this.selectedLanguage === 'darija' && this.lahajatiDataLoaded) {
      let filteredVoices = [...this.lahajatiVoices]

      // Apply Darija-specific filters
      if (this.selectedDialect) {
        filteredVoices = filteredVoices.filter(voice => voice.dialect === this.selectedDialect)
      }

      if (this.selectedPerformanceStyle) {
        filteredVoices = filteredVoices.filter(voice => voice.performanceStyle === this.selectedPerformanceStyle)
      }

      // Apply general filters
      if (this.selectedGender) {
        filteredVoices = filteredVoices.filter(voice => voice.gender === this.selectedGender)
      }

      if (this.selectedAge) {
        filteredVoices = filteredVoices.filter(voice => voice.ageZone === this.selectedAge)
      }

      // Apply favorites filter
      if (this.showFavoritesOnly) {
        const favoriteUrls = this.favoriteVoices.map(fav => fav.voiceUrl)
        filteredVoices = filteredVoices.filter(voice =>
          favoriteUrls.includes(voice.voice_id || voice.id || '')
        )
      }

      this.allVoices = filteredVoices
      this.totalVoices = filteredVoices.length
      this.applyPagination()
    }
  }

  // Apply pagination to current voice list
  applyPagination() {
    const startIndex = this.currentPageIndex * this.pageSize
    const endIndex = startIndex + this.pageSize
    this.voices = this.allVoices.slice(startIndex, endIndex)
    this.hasMorePages = endIndex < this.allVoices.length
  }

  loadFavoriteVoices(): void {
    this.favoriteVoicesService.getAllFavorites().subscribe({
      next: (favorites) => {
        this.favoriteVoices = favorites;
        // If we're showing favorites only, reload the voices
        if (this.showFavoritesOnly) {
          this.loadVoices();
        }
      },
      error: (error) => {
        console.error('Error loading favorite voices:', error);
      }
    });
  }

  loadVoices(): void {
    this.isLoading = true;

    // If Darija is selected and data is loaded, use Lahajati voices
    if (this.selectedLanguage === 'darija' && this.lahajatiDataLoaded) {
      this.applyDarijaVoices()
      this.isLoading = false
      return
    }

    // If Darija is selected but data is not loaded, wait for it
    if (this.selectedLanguage === 'darija' && !this.lahajatiDataLoaded) {
      this.fetchLahajatiData()
      // The applyDarijaVoices will be called when data is loaded
      this.isLoading = false
      return
    }

    // For other languages, use ElevenLabs service
    this.voiceService.listSharedVoices(
      this.pageSize,
      null, // search
      null, // sort
      this.selectedCategory,
      this.selectedGender,
      this.selectedAge,
      this.selectedAccent,
      this.selectedLanguage,
      this.currentPageIndex
    ).pipe(
      map(response => {
        // Filter by favorites if needed
        if (this.showFavoritesOnly) {
          const favoriteUrls = this.favoriteVoices.map(fav => fav.voiceUrl);
          return {
            ...response,
            voices: response.voices.filter(voice =>
              favoriteUrls.includes(voice.voice_id || voice.url || '')
            )
          };
        }
        return response;
      })
    ).subscribe({
      next: (response) => {
        this.voices = response.voices;
        this.allVoices = response.voices;
        this.totalVoices = response.total || response.voices.length;
        this.hasMorePages = response.has_more || false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading voices:', error);
        this.isLoading = false;
      }
    });
  }

  // Check if Darija is currently selected
  isDarijaSelected(): boolean {
    return this.selectedLanguage === "darija"
  }

  // Method to handle dialect selection
  onDialectChange(event: any): void {
    const dialectId = event.target ? event.target.value : event;
    this.selectedDialect = dialectId
    this.currentPageIndex = 0
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices()
    }
  }

  // Method to handle performance style selection
  onPerformanceStyleChange(event: any): void {
    const styleId = event.target ? event.target.value : event;
    this.selectedPerformanceStyle = styleId
    this.currentPageIndex = 0
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices()
    }
  }

  // Favorite voice methods
  isFavorite(voice: any): boolean {
    const voiceUrl = voice.voice_url || voice.voice_id || voice.id || '';
    return this.favoriteVoices.some(fav => fav.voiceUrl === voiceUrl);
  }

  toggleFavoriteVoice(voice: any): void {
    const voiceUrl = voice.voice_id || voice.id || voice.url || '';

    if (this.isFavorite(voice)) {
      // Find the favorite to delete
      const favoriteToDelete = this.favoriteVoices.find(fav => fav.voiceUrl === voiceUrl);
      if (favoriteToDelete) {
        // Assuming the ID is stored in the DTO or can be derived
        const id = favoriteToDelete['id']; // Adjust based on your actual data structure
        this.favoriteVoicesService.deleteFavorite(id).subscribe({
          next: () => {
            this.favoriteVoices = this.favoriteVoices.filter(fav => fav.voiceUrl !== voiceUrl);
            // If showing favorites only, reload to remove the unfavorited voice
            if (this.showFavoritesOnly) {
              this.loadVoices();
            }
          },
          error: (error) => console.error('Error removing favorite:', error)
        });
      }
    } else {
      // Add to favorites
      const newFavorite: FavoriteVoicesDto = {
        userUuid: this.uuid, // Assuming this is the current user's UUID
        voiceUrl: voiceUrl
      };

      this.favoriteVoicesService.createFavorite(newFavorite).subscribe({
        next: (createdFavorite) => {
          this.favoriteVoices.push(createdFavorite);
        },
        error: (error) => console.error('Error adding favorite:', error)
      });
    }
  }

  toggleFavorites(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.currentPageIndex = 0; // Reset to first page
    this.loadVoices();
  }

  // Existing filter methods
  filterVoices(languageCode: string): void {
    // Update the active language
    this.languages = this.languages.map(lang => ({
      ...lang,
      active: lang.code === languageCode
    }));

    this.selectedLanguage = languageCode;
    this.currentPageIndex = 0; // Reset to first page
    
    // Reset Darija-specific filters when changing language
    if (languageCode !== 'darija') {
      this.selectedDialect = '';
      this.selectedPerformanceStyle = '';
    }
    
    this.loadVoices();
  }

  filterByLanguage(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedLanguage = value;
    this.currentPageIndex = 1;
    
    // Reset Darija-specific filters when changing language
    if (value !== 'darija') {
      this.selectedDialect = '';
      this.selectedPerformanceStyle = '';
    }
    
    this.loadVoices();
  }

  filterByAccent(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedAccent = value;
    this.currentPageIndex = 1;
    this.loadVoices();
  }

  filterByAge(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedAge = value;
    this.currentPageIndex = 1;
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices();
    } else {
      this.loadVoices();
    }
  }

  filterByGender(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedGender = value;
    this.currentPageIndex = 1;
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices();
    } else {
      this.loadVoices();
    }
  }

  filterByCategory(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedCategory = value;
    this.currentPageIndex = 1;
    this.loadVoices();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPageIndex = 1;
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices();
    } else {
      this.loadVoices();
    }
  }

  resetFilters(): void {
    this.selectedLanguage = '';
    this.selectedAccent = '';
    this.selectedAge = '';
    this.selectedGender = '';
    this.selectedCategory = '';
    this.selectedDialect = '';
    this.selectedPerformanceStyle = '';
    this.showFavoritesOnly = false;

    // Reset active state in language pills
    this.languages = this.languages.map(lang => ({
      ...lang,
      active: false
    }));

    this.currentPageIndex = 1;
    this.loadVoices();
  }

  // Pagination methods
  nextPage(): void {
    if (this.hasMorePages) {
      this.currentPageIndex++;
      if (this.selectedLanguage === 'darija') {
        this.applyDarijaVoices();
      } else {
        this.loadVoices();
      }
    }
  }

  prevPage(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      if (this.selectedLanguage === 'darija') {
        this.applyDarijaVoices();
      } else {
        this.loadVoices();
      }
    }
  }

  firstPage(): void {
    this.currentPageIndex = 0;
    if (this.selectedLanguage === 'darija') {
      this.applyDarijaVoices();
    } else {
      this.loadVoices();
    }
  }

  // Voice playback
  playVoice(voice: any) {
    // Check if the same voice is clicked again
    const voiceId = voice.voice_id || voice.id;
    // Check if the same voice is clicked again
    if (this.currentAudio && this.currentPlayingVoiceId === voiceId) {
      // Stop the currently playing audio
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentPlayingVoiceId = null;
      console.log(`Stopped voice: ${voice.name}`);
      return;
    }

    // Stop previous audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    if (!voice.preview_url) {
      console.error("No preview URL available for this voice.");
      return;
    }

    // Create and play new audio
    this.currentAudio = new Audio(voice.preview_url);
    this.currentPlayingVoiceId = voiceId;

    this.currentAudio.play()
      .then(() => console.log(`Playing voice: ${voice.name}`))
      .catch(error => console.error("Error playing audio:", error));

    // Add event listener to reset when audio ends naturally
    this.currentAudio.addEventListener('ended', () => {
      this.currentAudio = null;
      this.currentPlayingVoiceId = null;
    });
  }

  // Helper method to get the correct route parameters for voice generation
  getVoiceRouteParams(voice: any): any[] {
    if (voice.language === 'darija') {
      return [
        '/speakerDasboard',
        this.uuid,
        'generate-with-selected-voice',
        voice.voice_id || voice.id,
        voice.name,
        voice.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + voice.name,
        voice.gender || 'Non défini',
        voice.ageZone || voice.labels?.age || 'Non défini',
        voice.category || 'darija',
        voice.language || 'darija',
        voice.preview_url || voice.originalVoiceUrl || 'no-preview'
      ];
    } else {
      return [
        '/speakerDasboard',
        this.uuid,
        'generate-with-selected-voice',
        voice.voice_id,
        voice.name,
        'https://api.dicebear.com/7.x/initials/svg?seed=' + voice.name,
        voice.labels?.gender || 'Non défini',
        voice.labels?.age || 'Non défini',
        voice.category || 'Non classé',
        voice.fine_tuning?.language || 'Non défini',
        voice.preview_url || 'no-preview'
      ];
    }
  }
}
