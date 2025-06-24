import { Component,  ElementRef,  OnInit, ViewChild } from "@angular/core"
import  { ActivatedRoute } from "@angular/router"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionService } from "../../../services/action.service"
import  { TranslateService } from "@ngx-translate/core"

@Component({
  selector: "app-generate-with-slected-voice",
  templateUrl: "./generate-with-slected-voice.component.html",
  styleUrls: ["./generate-with-slected-voice.component.css"],
})
export class GenerateWithSlectedVoiceComponent implements OnInit {
  @ViewChild("audioElement") audioElement!: ElementRef<HTMLAudioElement>
  @ViewChild("progressBar") progressBar!: ElementRef<HTMLDivElement>
  voices: Voice[] = []
  filteredVoices: Voice[] = []
  selectedVoice: Voice | null = null
  audio = new Audio()
  showVoiceSelection = true
  showVoice = true
  voice: Voice | null = null
  currentPage = 1
  voicesPerPage = 3
  emotions = ["Neutral", "Happy", "Sad", "Angry"]
  selectedEmotion = "Neutral"
  vitess = 1.0
  rate = 44100
  temperature = 1.0
  actionData = { text: "The senseiprod voice generator can deliver high-quality, human-like speech in 32 languages." }
  price = 0.05 // Example price per character
  baseUrl = "https://api.voice-service.com"
  audioUrl: SafeUrl | null = null
  audioPlayer = new Audio()
  voiceId: string | null = null
  uuid: string | null = null
  currentPlayingVoiceId: string | null = null;
  languages = [
    { code: 'en', name: 'Anglais', active: true },
    { code: 'fr', name: 'Français', active: false },
    { code: 'ar', name: 'Arabe', active: false },
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
  
  
  // Audio player properties
  isPlaying = false
  isMuted = false
  volume = 100
  currentTime = 0
  duration = 0
  progressPercentage = 0
  waveformBars: number[] = []
  // Project related properties
  projects: Project[] = []
  selectedProject: Project | null = null
  showProjectSelection = false
  isGenerating = false
  generationSuccess = false
  generationError: string | null = null

  // Tab selection
  activeTab: "free" | "request" = "free"

  // Character limits
  freeTestCharLimit = 100

  // Checkout data
  checkoutData = {
    textLength: 0,
    price: 0,
    totalPrice: 0,
    voiceId: "",
    voiceName: "",
  }

  // Filters
  filters = {
    search: "",
    gender: "",
    ageZone: "",
    type: "",
    language: "",
  }

  constructor(
    private elevenLabsService: ElevenLabsService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
    private translate: TranslateService,
  ) {
    // Generate random waveform bars for visualization
    this.generateWaveformBars()
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const voice_id = params['voice_id']
      const voice_name = params['voice_name']
      const voice_photo = params['voice_photo']
      const voice_gender = params['voice_gender']
      const voice_age = params['voice_age']
      const voice_category = params['voice_category']
      const voice_language = params['voice_language']
      const voice_preview_url = params['voice_preview_url']
      this.uuid = params['uuid'] || null

      // Create voice object from URL parameters
      this.voice = {
        id: voice_id,
        name: voice_name || "Unknown",
        gender: voice_gender || "Not specified",
        ageZone: voice_age || "Not specified",
        type: voice_category || "Unclassified",
        language: voice_language || "Not specified",
        avatar: voice_photo,
        price: 0,
        originalVoiceUrl: voice_preview_url || "",
        clonedVoiceUrl: "",
      }
      this.selectedVoice = this.voice

      // Start with voice showcase (not selection)
      this.showVoiceSelection = false
    })

    // Fetch voices and projects
    this.fetchVoices()
    this.fetchUserProjects()

    // Set up translation
    this.translate.setDefaultLang("en")
    const browserLang = this.translate.getBrowserLang()
    if (browserLang) {
      this.translate.use(browserLang.match(/en|fr|es/) ? browserLang : "en")
    }
  }
// Audio player methods
generateWaveformBars() {
  this.waveformBars = Array.from({ length: 50 }, () => Math.random() * 100)
}

togglePlayPause() {
  if (!this.audioElement) return

  const audio = this.audioElement.nativeElement
  if (this.isPlaying) {
    audio.pause()
  } else {
    audio.play()
  }
  this.isPlaying = !this.isPlaying
}

onAudioLoaded() {
  if (this.audioElement) {
    const audio = this.audioElement.nativeElement
    this.duration = audio.duration
    audio.volume = this.volume / 100
  }
}

onTimeUpdate() {
  if (this.audioElement) {
    const audio = this.audioElement.nativeElement
    this.currentTime = audio.currentTime
    this.progressPercentage = (this.currentTime / this.duration) * 100
  }
}

onAudioEnded() {
  this.isPlaying = false
  this.currentTime = 0
  this.progressPercentage = 0
}

seekTo(event: MouseEvent) {
  if (!this.audioElement || !this.progressBar) return

  const progressBarElement = this.progressBar.nativeElement
  const rect = progressBarElement.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = (clickX / rect.width) * 100

  const audio = this.audioElement.nativeElement
  const newTime = (percentage / 100) * this.duration
  audio.currentTime = newTime
  this.progressPercentage = percentage
}

toggleMute() {
  if (!this.audioElement) return

  const audio = this.audioElement.nativeElement
  this.isMuted = !this.isMuted
  audio.muted = this.isMuted
}

setVolume(event: any) {
  if (!this.audioElement) return

  this.volume = event.target.value
  const audio = this.audioElement.nativeElement
  audio.volume = this.volume / 100

  if (this.volume === 0) {
    this.isMuted = true
    audio.muted = true
  } else if (this.isMuted) {
    this.isMuted = false
    audio.muted = false
  }
}

formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

  fetchUserProjects() {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        this.projects = data
        console.log("Projects retrieved:", this.projects)
      },
      (error) => {
        console.error("Error retrieving projects:", error)
      },
    )
  }

  fetchVoices() {
    this.elevenLabsService.listVoicesFiltter().subscribe(
      (voices: Voice[]) => {
        this.voices = voices
        this.filteredVoices = this.voices
        // Apply filters if a voice was selected
        if (this.selectedVoice) {
          this.applyFilters()
        }
      },
      (error) => {
        console.error("Error retrieving voices:", error)
      },
    )
  }

  findAndSelectVoiceById(voiceId: string) {
    // Find the voice with the matching ID
    const voice = this.voices.find((v) => v.id === voiceId)
    if (voice) {
      // Select the voice
      this.selectedVoice = voice
      this.price = voice.price || this.price

      // Update filters based on the selected voice properties
      this.filters.gender = voice.gender || ""
      this.filters.language = voice.language || ""
      this.filters.ageZone = voice.ageZone || ""
      this.filters.type = voice.type || ""

      // Apply filters to show similar voices
      this.applyFilters()

      console.log("Selected voice from URL:", voice.name)
    } else {
      console.warn(`Voice with ID ${voiceId} not found`)
    }
  }

  selectProject(project: Project) {
    this.selectedProject = project
    this.showProjectSelection = false
  }

  toggleProjectSelection() {
    this.showProjectSelection = !this.showProjectSelection
  }

  setActiveTab(tab: "free" | "request") {
    this.activeTab = tab
    // Reset error messages when switching tabs
    this.generationError = null
    this.generationSuccess = false
  }

  isTextOverLimit(): boolean {
    if (this.activeTab === "free") {
      return this.actionData.text.length > this.freeTestCharLimit
    }
    return false
  }

  limitText() {
    if (this.activeTab === "free" && this.actionData.text.length > this.freeTestCharLimit) {
      this.actionData.text = this.actionData.text.substring(0, this.freeTestCharLimit)
    }
  }

  generateSpeech() {
    if (!this.selectedVoice) {
      this.generationError = "Please select a voice first"
      return
    }

    // For free test, enforce character limit
    if (this.activeTab === "free") {
      if (this.actionData.text.length > this.freeTestCharLimit) {
        this.limitText()
      }
      this.processAudioGeneration()
    }
    // For audio request, proceed to checkout
    else if (this.activeTab === "request") {
      this.proceedToCheckout()
    }
  }

  processAudioGeneration() {
    this.isGenerating = true
    this.generationError = null
    this.generationSuccess = false

    this.elevenLabsService.textToSpeech(this.selectedVoice!.id, this.actionData.text).subscribe(
      (blob) => {
        const url = URL.createObjectURL(blob)
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url)

        // If a project is selected, save the audio to that project
        if (this.selectedProject) {
          this.saveAudioToProject(blob)
        } else {
          this.isGenerating = false
          this.generationSuccess = true
        }
      },
      (error) => {
        console.error("Error generating speech:", error)
        this.isGenerating = false
        this.generationError = "Failed to generate speech. Please try again."
      },
    )
  }

  proceedToCheckout() {
    if (!this.selectedVoice) return

    // Prepare checkout data
    this.checkoutData = {
      textLength: this.actionData.text.length,
      price: this.selectedVoice.price || this.price,
      totalPrice: (this.selectedVoice.price || this.price) * this.actionData.text.length,
      voiceId: this.selectedVoice.id,
      voiceName: this.selectedVoice.name,
    }

    // Navigate to checkout with data
    // Using state to pass data to the checkout component
    window.location.href = `/checkout?data=${encodeURIComponent(
      JSON.stringify({
        checkoutData: this.checkoutData,
        text: this.actionData.text,
        voiceSettings: {
          emotion: this.selectedEmotion,
          speed: this.vitess,
          sampleRate: this.rate,
          temperature: this.temperature,
        },
      }),
    )}`
  }

  saveAudioToProject(audioBlob: Blob) {
    if (!this.selectedProject || !this.selectedVoice) {
      this.isGenerating = false
      return
    }

    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append("text", this.actionData.text)
    formData.append("statutAction", "EN_ATTENTE")
    formData.append("voiceUuid", this.selectedVoice.id)
    formData.append("utilisateurUuid", this.uuid || "")
    formData.append("language", this.selectedVoice.language)
    formData.append("projectUuid", this.selectedProject.uuid)
    formData.append("audioGenerated", audioBlob, "audio.mp3")

    this.actionService.createAction(formData).subscribe(
      (response) => {
        console.log("Audio saved to project:", response)
        this.isGenerating = false
        this.generationSuccess = true
      },
      (error) => {
        console.error("Error saving audio to project:", error)
        this.isGenerating = false
        this.generationError = "Failed to save audio to project. Please try again."
      },
    )
  }

  applyFilters(): void {
    this.filteredVoices = this.voices.filter(
      (voice) =>
        (this.filters.search === "" || voice.name.toLowerCase().includes(this.filters.search.toLowerCase())) &&
        (this.filters.gender === "" || voice.gender === this.filters.gender) &&
        (this.filters.ageZone === "" || voice.ageZone === this.filters.ageZone) &&
        (this.filters.type === "" || voice.type === this.filters.type) &&
        (this.filters.language === "" || voice.language === this.filters.language),
    )
  }

  resetFilters(): void {
    this.filters = { search: "", gender: "", ageZone: "", type: "", language: "" }
    this.filteredVoices = [...this.voices]
  }

  selectVoice(voice: Voice): void {
    this.selectedVoice = voice
    this.price = voice.price || this.price
  }

  closeModal() {
    this.showVoiceSelection = false
    this.showVoice = true
  }

  toggleVoiceSelection() {
    this.showVoiceSelection = !this.showVoiceSelection
  }

  playVoice(voice: Voice): void {
    const voiceId = voice.id || voice.id;

    if (this.audio && !this.audio.paused && this.audio.src === voice.originalVoiceUrl && this.currentPlayingVoiceId === voiceId) {
      this.stopVoice() // Stop if the same audio is playing
      this.currentPlayingVoiceId = null; // Reset current playing voice ID
    } else {
      this.stopVoice() // Stop any previous audio
      this.currentPlayingVoiceId = voiceId; // Set current playing voice ID
      this.audio = new Audio(voice.originalVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing voice:", error))
    }
  }

  playOriginalVoice(voice: Voice): void {
    const voiceId = voice.id || voice.id;

    if (this.audio && !this.audio.paused && this.audio.src === voice.originalVoiceUrl  && this.currentPlayingVoiceId === voiceId) {
      this.stopVoice() // Stop if the same audio is playing
      this.currentPlayingVoiceId = null; // Reset current playing voice ID
    } else {
      this.stopVoice() // Stop any previous audio
      this.currentPlayingVoiceId = voiceId; // Set current playing voice ID
      this.audio = new Audio(voice.originalVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing original voice:", error))
    }
  }

  playClonedVoice(voice: Voice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.clonedVoiceUrl) {
      this.stopVoice() // Stop if the same audio is playing
    } else {
      this.stopVoice() // Stop any previous audio
      this.audio = new Audio(voice.clonedVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing cloned voice:", error))
    }
  }

  stopVoice(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0 // Reset playback position
      this.audio = new Audio() // Clear the audio instance
    }
  }

  // Get profile image based on gender
  getVoiceProfileImage(voice: Voice): string {
    if (voice.gender === "Male") {
      return "assets/img/male-voice-profile.jpg"
    } else if (voice.gender === "Female") {
      return "assets/img/female-voice-profile.jpg"
    } else {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${voice.name}`
    }
  }
  // Add these properties to your component class
  showCharLimitModal = false
  userAcceptedPaidContent = false
  hasExceededLimit = false
  previousTextLength = 0

  // Add these methods to your component class

  checkTextLength(): void {
    const currentLength = this.actionData.text.length

    // Only show the popup when crossing the threshold from below 100 to above 100
    if (currentLength > 100 && this.previousTextLength <= 100 && !this.userAcceptedPaidContent) {
      this.showCharLimitModal = true
    }

    this.previousTextLength = currentLength
  }

  acceptExceedLimit(): void {
    this.userAcceptedPaidContent = true
    this.showCharLimitModal = false
  }

  cancelExceedLimit(): void {
    // If user cancels, trim the text to 100 characters
    if (this.actionData.text.length > 100) {
      this.actionData.text = this.actionData.text.substring(0, 100)
    }
    this.showCharLimitModal = false
    this.previousTextLength = this.actionData.text.length
  }

  calculateTotal(): number {
    if (this.actionData.text.length <= 100) {
      return 0 // Free for first 100 characters
    } else {
      // Only charge for characters beyond 100
      return this.price * (this.actionData.text.length - 100)
    }
  }
}
