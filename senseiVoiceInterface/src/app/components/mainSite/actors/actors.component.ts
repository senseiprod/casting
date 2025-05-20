import { Component,  OnInit,  OnDestroy } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { SpeakerResponse, SpeakerService } from "../../../services/speaker-service.service"
import  { UtilisateurService } from "../../../services/utilisateur-service.service"
import {  AudioService, TypeAudio } from "src/app/services/audio.service"
import  { AuthService } from "src/app/services/auth.service"
import  { Subscription } from "rxjs"
import {ReservationSpeakerService ,ReservationSpeakerDto} from "../../../services/speaker-reservation.service";

export interface Voice {
  id: number
  title: string
  description: string
  language: string
  flagCode: string
}

export interface Language {
  code: string
  name: string
  active: boolean
}

export interface AudioData {
  blob: Blob
  url: string
  type: "clone" | "original"
}

@Component({
  selector: "app-actors",
  templateUrl: "./actors.component.html",
  styleUrls: ["./actors.component.css"],
})
export class ActorsComponent implements OnInit, OnDestroy {
  speakers: SpeakerResponse[] = []
  filteredSpeakers: SpeakerResponse[] = []
  searchQuery = ""
  photoUrls: { [key: string]: string } = {} // Stocker les URLs des photos
  isLoading = false

  // Filter values
  selectedRole = ""
  selectedLanguage = "All language"

  // Audio playback
  currentAudio: HTMLAudioElement | null = null
  currentPlayingSpeakerId: string | null = null
  currentPlayingType: "clone" | "original" | null = null
  speakerAudios: { [key: string]: { [type: string]: AudioData } } = {} // Store audio data by speaker ID and type
  isLoadingAudio: { [key: string]: boolean } = {} // Track loading state for each speaker's audio
  audioSubscriptions: Subscription[] = []

  // Voice type selection
  selectedVoiceType: { [key: string]: "clone" | "original" } = {}
  conectedUuid: string
  // Reservation modal
  showReservationModal = false
  selectedSpeaker: SpeakerResponse | null = null
  reservationForm: FormGroup
  minDate: string

  // Voice over types
  voiceOverTypes = [
    { id: "commercial", name: "Commercial" },
    { id: "narrative", name: "Narration" },
    { id: "corporate", name: "Corporate" },
    { id: "elearning", name: "E-Learning" },
    { id: "character", name: "Character Voice" },
  ]

  constructor(
    private speakerService: SpeakerService,
    private utilisateurService: UtilisateurService,
    private audioService: AudioService,
    private fb: FormBuilder,
    private authService: AuthService,
    private reservation : ReservationSpeakerService,
  ) {
    // Set minimum date to today
    const today = new Date()
    this.minDate = today.toISOString().split("T")[0]

    // Initialize the reservation form
    this.reservationForm = this.fb.group({
      date: [this.minDate, Validators.required],
      time: ["09:00", Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(240)]],
      voiceOverType: ["commercial", Validators.required],
      notes: [""],
    })
  }
  selectLanguage(language : string):void{
    this.selectedLanguage = language;
    if (language !=='All'){
    this.filteredSpeakers = this.speakers.filter((speaker) => {
      const langue = `${speaker.username}`.toLowerCase()
      return langue === language
    })}
    else {
      this.filteredSpeakers = this.speakers
    }
  }
  ngOnInit(): void {
    this.authService.getUserConnect().subscribe((data) => {
      this.conectedUuid = data.uuid
    })
    this.loadSpeakers()
  }

  ngOnDestroy(): void {
    // Clean up all audio subscriptions
    this.audioSubscriptions.forEach((sub) => sub.unsubscribe())

    // Clean up any playing audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }

    // Clean up any created object URLs
    Object.values(this.speakerAudios).forEach((audioByType) => {
      Object.values(audioByType).forEach((audio) => {
        if (audio.url) {
          URL.revokeObjectURL(audio.url)
        }
      })
    })
  }

  loadSpeakers() {
    this.isLoading = true
    this.speakerService.getAllSpeakers().subscribe(
      (data) => {
        // Assuming the API doesn't return activeAnalyse, we'll add it for demo purposes
        this.speakers = data.map((speaker) => ({
          ...speaker,
          activeAnalyse: Math.random() > 0.5, // Randomly set activeAnalyse for demo
        }))
        this.filteredSpeakers = [...this.speakers]
        this.speakers.forEach((speaker) => {
          this.loadPhoto(speaker.uuid)
          this.loadSpeakerAudios(speaker.uuid)
          // Set default voice type to 'clone'
          this.selectedVoiceType[speaker.uuid] = "clone"
        })
        this.isLoading = false
      },
      (error) => {
        console.error("Error loading speakers:", error)
        this.isLoading = false
      },
    )
  }

  loadPhoto(userId: string) {
    this.utilisateurService.getPhoto(userId).subscribe(
      (response) => {
        const reader = new FileReader()
        reader.readAsDataURL(response)
        reader.onload = () => {
          this.photoUrls[userId] = reader.result as string
        }
      },
      (error) => {
        console.error(`Error loading photo for user ${userId}:`, error)
        // Set a placeholder image on error
        this.photoUrls[userId] = "assets/img/avatar men.png"
      },
    )
  }

  loadSpeakerAudios(speakerId: string) {
    this.isLoadingAudio[speakerId] = true

    // Initialize audio storage for this speaker
    this.speakerAudios[speakerId] = {}

    const subscription = this.audioService.getAllAudiosBySpeaker(speakerId).subscribe(
      (audioResponses) => {
        // Process each audio response
        audioResponses.forEach((response) => {
          // Convert the byte array to a blob
          const blob = new Blob([response.audioFile], { type: "audio/mp3" })
          const url = URL.createObjectURL(blob)

          // Map TypeAudio enum to our internal type
          const type = response.typeAudio === TypeAudio.ORIGINAL ? "original" : "clone"

          // Store the audio data
          this.speakerAudios[speakerId][type] = {
            blob,
            url,
            type,
          }
        })

        this.isLoadingAudio[speakerId] = false
      },
      (error) => {
        console.error(`Error loading audio for speaker ${speakerId}:`, error)
        this.isLoadingAudio[speakerId] = false
      },
    )

    this.audioSubscriptions.push(subscription)
  }

  // Add this method to filter speakers by name
  filterSpeakersByName() {
    if (!this.searchQuery || this.searchQuery.trim() === "") {
      // If search query is empty, show all speakers
      this.filteredSpeakers = [...this.speakers]
    } else {
      // Filter speakers by name (first name or last name)
      const query = this.searchQuery.toLowerCase().trim()
      this.filteredSpeakers = this.speakers.filter((speaker) => {
        const fullName = `${speaker.prenom} ${speaker.nom}`.toLowerCase()
        return fullName.includes(query)
      })
    }
  }

  // Update the searchSpeakers method to use local filtering instead of API call
  searchSpeakers() {
    // If you want to keep the API search functionality, uncomment the API call
    // and comment out the filterSpeakersByName() call

    // Local filtering by name
    this.filterSpeakersByName()

    /* API-based search (commented out)
    this.isLoading = true;
    if (this.searchQuery.trim()) {
      this.speakerService.searchSpeakers(this.searchQuery).subscribe(
        (data) => {
          // Add activeAnalyse property for demo
          this.speakers = data.map((speaker) => ({
            ...speaker,
            activeAnalyse: Math.random() > 0.5,
          }));
          this.applyFilters();
          this.speakers.forEach((speaker) => {
            this.loadPhoto(speaker.uuid);
            // Load audio if not already loaded
            if (!this.speakerAudios[speaker.uuid]) {
              this.loadSpeakerAudios(speaker.uuid);
            }
          });
          this.isLoading = false;
        },
        (error) => {
          console.error("Error searching speakers:", error);
          this.isLoading = false;
        },
      );
    } else {
      this.loadSpeakers();
    }
    */
  }

  filterByRole(event: any) {
    this.selectedRole = event.target.value
    this.applyFilters()
  }

  filterByLanguage(event: any) {
    this.selectedLanguage = event.target.value
    this.applyFilters()
  }

  // Update the applyFilters method to also consider the name search
  applyFilters() {
    this.filteredSpeakers = this.speakers.filter((speaker) => {
      // Apply role filter if selected
      const matchesRole = !this.selectedRole || speaker.role === this.selectedRole

      // Apply language filter if selected
      const matchesLanguage = !this.selectedLanguage

      // Apply name search if there's a query
      let matchesName = true
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim()
        const fullName = `${speaker.prenom} ${speaker.nom}`.toLowerCase()
        matchesName = fullName.includes(query)
      }

      return matchesRole && matchesLanguage && matchesName
    })
  }

  getPhoto(userId: string): string {
    return this.photoUrls[userId] || "assets/img/avatar men.png"
  }

  hasAudioType(speakerId: string, type: "clone" | "original"): boolean {
    return !!(this.speakerAudios[speakerId] && this.speakerAudios[speakerId][type])
  }

  playAudio(speaker: SpeakerResponse, type: "clone" | "original") {
    const speakerId = speaker.uuid

    // If the same audio is already playing, pause it
    if (this.currentPlayingSpeakerId === speakerId && this.currentPlayingType === type && this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
      this.currentPlayingSpeakerId = null
      this.currentPlayingType = null
      return
    }

    // Stop any currently playing audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
      this.currentPlayingSpeakerId = null
      this.currentPlayingType = null
    }

    // Check if we have audio for this speaker and type
    if (this.hasAudioType(speakerId, type)) {
      const audioData = this.speakerAudios[speakerId][type]

      // Create and play the audio
      this.currentAudio = new Audio(audioData.url)
      this.currentPlayingSpeakerId = speakerId
      this.currentPlayingType = type

      this.currentAudio
        .play()
        .then(() => console.log(`Playing ${type} audio for ${speaker.prenom} ${speaker.nom}`))
        .catch((error) => {
          console.error("Error playing audio:", error)
          this.currentAudio = null
          this.currentPlayingSpeakerId = null
          this.currentPlayingType = null
        })

      // Reset when audio ends
      this.currentAudio.addEventListener("ended", () => {
        this.currentAudio = null
        this.currentPlayingSpeakerId = null
        this.currentPlayingType = null
      })
    } else {
      console.warn(`No ${type} audio available for speaker ${speakerId}`)
    }
  }

  isPlaying(speakerId: string, type: "clone" | "original"): boolean {
    return this.currentPlayingSpeakerId === speakerId && this.currentPlayingType === type
  }

  bookSpeaker(speaker: SpeakerResponse) {
    console.log(`Opening reservation form for speaker: ${speaker.prenom} ${speaker.nom}`)
    // Set the selected speaker and show the modal
    this.selectedSpeaker = speaker
    this.showReservationModal = true
    // Reset the form to default values
    this.reservationForm.reset({
      date: this.minDate,
      time: "09:00",
      durationMinutes: 30,
      voiceOverType: "commercial",
      notes: "",
    })
  }

  closeReservationModal() {
    this.showReservationModal = false
    this.selectedSpeaker = null
  }

  submitReservation() {
    const reservation: ReservationSpeakerDto = {
      userUuid: this.conectedUuid,
      speakerUuid: this.selectedSpeaker.uuid,
      service: this.reservationForm.get('voiceOverType')?.value,
      date: this.reservationForm.get('date')?.value
    };

    this.reservation.createReservation(reservation).subscribe((data)=>{
      alert('the reservation is created secsesfuly')
    });

      // Close the modal
      this.closeReservationModal()

  }
}
