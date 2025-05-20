import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ElevenLabsService} from "../../../services/eleven-labs.service";
import {AuthService} from "../../../services/auth.service";
import {FavoriteVoicesDto, FavoriteVoicesService} from "../../../services/favorite-voices.service";
import {map} from "rxjs/operators";
interface Voice {
  id: string;
  name: string;
  description: string;
  language: string;
  flagCode: string;
  sampleUrl: string;
  preview_url?: string;
}

export interface Language {
  code: string;
  name: string;
  active: boolean;
}
@Component({
  selector: 'app-humain-voice',
  templateUrl: './humain-voice.component.html',
  styleUrls: ['./humain-voice.component.css']
})
export class HumainVoiceComponent implements OnInit{
  languages = [
    { code: 'en', name: 'Anglais', active: true },
    { code: 'fr', name: 'Français', active: false },
    { code: 'ar', name: 'Arabe', active: false },
    { code: 'de', name: 'Allemand', active: false },
    { code: 'es', name: 'Espagnol', active: false },
    { code: 'tr', name: 'Turc', active: false },
    { code: 'it', name: 'Italien', active: false }
  ];

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
    { code: 'non-binary', name: 'Non-binaire', active: false }
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
    private voiceService: ElevenLabsService ,
    private authService : AuthService// Your existing voice service
  ) {}

  ngOnInit(): void {
    this.authService.getUserConnect().subscribe((data)=>{
      this.uuid = data.uuid ;
      this.loadFavoriteVoices();
      this.loadVoices();
    });

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

    this.voiceService.listSharedVoices(
      this.pageSize,
      null, // search
      null, // sort
      "professional",
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

  // Favorite voice methods
  isFavorite(voice: any): boolean {
    const voiceUrl = voice.voice_url || voice.voice_id || '';
    return this.favoriteVoices.some(fav => fav.voiceUrl === voiceUrl);
  }

  toggleFavoriteVoice(voice: any): void {
    const voiceUrl = voice.voice_id || voice.url || '';

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
    this.loadVoices();
  }

  filterByLanguage(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedLanguage = value;
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  filterByAccent(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedAccent = value;
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  filterByAge(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedAge = value;
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  filterByGender(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedGender = value;
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  filterByCategory(event: any): void {
    const value = event.target ? event.target.value : event;
    this.selectedCategory = value;
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPageIndex = 0;
    this.loadVoices();
  }

  resetFilters(): void {
    this.selectedLanguage = '';
    this.selectedAccent = '';
    this.selectedAge = '';
    this.selectedGender = '';
    this.selectedCategory = '';
    this.showFavoritesOnly = false;

    // Reset active state in language pills
    this.languages = this.languages.map(lang => ({
      ...lang,
      active: false
    }));

    this.currentPageIndex = 0;
    this.loadVoices();
  }

  // Pagination methods
  nextPage(): void {
    if (this.hasMorePages) {
      this.currentPageIndex++;
      this.loadVoices();
    }
  }

  prevPage(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.loadVoices();
    }
  }

  firstPage(): void {
    this.currentPageIndex = 0;
    this.loadVoices();
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
}
