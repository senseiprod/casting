import { Component,  ElementRef,  OnInit, ViewChild } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionService } from "../../../services/action.service"
import  { TranslateService } from "@ngx-translate/core"
import  { VoiceElenlabsService } from "../../../services/voice-elenlabs.service"

@Component({
  selector: "app-generate-with-voice-speaker",
  templateUrl: "./generate-with-voice-speaker.component.html",
  styleUrls: ["./generate-with-voice-speaker.component.css"],
})
export class GenerateWithVoiceSpeakerComponent implements OnInit {
  @ViewChild("audioElement") audioElement!: ElementRef<HTMLAudioElement>
  @ViewChild("progressBar") progressBar!: ElementRef<HTMLDivElement>

  voices: Voice[] = []
  filteredVoices: Voice[] = []
  selectedVoice: Voice | null = null

  // Audio player properties
  audio = new Audio()
  audioUrl: SafeUrl | null = null
  isPlaying = false
  isMuted = false
  volume = 100
  currentTime = 0
  duration = 0
  progressPercentage = 0
  waveformBars: number[] = []
  currentPlayingVoiceId: string | null = null

  // UI state
  showVoiceSelection = false
  showVoice = true
  showProjectSelection = false

  // Generation state
  isGenerating = false
  generationSuccess = false
  generationError: string | null = null

  // Voice settings
  selectedEmotion = "neutral"
  vitess = 1.0
  rate = 44100
  temperature = 1.0

  // Text and pricing
  actionData = { text: "The sensei prod voice generator can deliver high-quality, human-like speech in 32 languages." }
  price = 0.05
  freeTestCharLimit = 100

  // User and project data
  userId: string | null = ""
  projects: Project[] = []
  selectedProject: Project | null = null

  // Tab management
  activeTab: "free" | "request" = "free"

  // Pagination
  currentPage = 1
  voicesPerPage = 6

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
    private router: Router,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
    private voix2Service: VoiceElenlabsService,
    private translate: TranslateService,
  ) {
    this.generateWaveformBars()
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })

    // Load speaker voices
    this.loadSpeakerVoices()
    this.fetchUserProjects()

    // Set up translation
    this.translate.setDefaultLang("en")
    const browserLang = this.translate.getBrowserLang()
    if (browserLang) {
      this.translate.use(browserLang.match(/en|fr|es/) ? browserLang : "en")
    }
  }

  loadSpeakerVoices() {
    if (this.userId) {
      this.voix2Service.getVoicesBySpeaker(this.userId).subscribe({
        next: (data) => {
          if (data) {
            this.voices = data.map(
              (v): Voice => ({
                id: v.elevenlabs_id,
                name: v.name,
                gender: v.gender,
                ageZone: v.ageZone || "adult",
                type: v.typeVoice,
                language: v.language,
                avatar: v.avatar || this.getVoiceProfileImage({ gender: v.gender } as Voice),
                price: v.price,
                originalVoiceUrl: v.originalVoiceUrl || "",
                clonedVoiceUrl: v.elevenlabs_id,
              }),
            )

            this.filteredVoices = [...this.voices]
            this.selectedVoice = this.voices[0] || null
          }
        },
        error: (error) => {
          console.error("Error loading speaker voices:", error)
          this.loadFallbackVoices()
        },
      })
    } else {
      this.loadFallbackVoices()
    }
  }

  loadFallbackVoices() {
    this.elevenLabsService.listVoicesFiltter().subscribe({
      next: (voices: Voice[]) => {
        this.voices = voices
        this.filteredVoices = [...this.voices]
        this.selectedVoice = this.voices[0] || null
      },
      error: (error) => {
        console.error("Error retrieving fallback voices:", error)
      },
    })
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

  // Voice management methods
  selectVoice(voice: Voice): void {
    this.selectedVoice = voice
    this.price = voice.price || this.price
  }

  playVoice(voice: Voice): void {
    const voiceId = voice.id

    if (
      this.audio &&
      !this.audio.paused &&
      this.audio.src === voice.originalVoiceUrl &&
      this.currentPlayingVoiceId === voiceId
    ) {
      this.stopVoice()
      this.currentPlayingVoiceId = null
    } else {
      this.stopVoice()
      this.currentPlayingVoiceId = voiceId
      this.audio = new Audio(voice.originalVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing voice:", error))
    }
  }

  stopVoice(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = new Audio()
    }
  }

  // Filter methods
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

  // Project management
  fetchUserProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data
      },
      error: (error) => {
        console.error("Error retrieving projects:", error)
      },
    })
  }

  selectProject(project: Project) {
    this.selectedProject = project
    this.showProjectSelection = false
  }

  toggleProjectSelection() {
    this.showProjectSelection = !this.showProjectSelection
  }

  // Tab management
  setActiveTab(tab: "free" | "request") {
    this.activeTab = tab
    this.generationError = null
    this.generationSuccess = false
  }

  // Text validation
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

  // Speech generation
  generateSpeech() {
    if (!this.selectedVoice) {
      this.generationError = "Please select a voice first"
      return
    }

    if (this.activeTab === "free") {
      if (this.actionData.text.length > this.freeTestCharLimit) {
        this.limitText()
      }
      this.processAudioGeneration()
    } else if (this.activeTab === "request") {
      this.proceedToCheckout()
    }
  }

  processAudioGeneration() {
    this.isGenerating = true
    this.generationError = null
    this.generationSuccess = false

    this.elevenLabsService.textToSpeech(this.selectedVoice!.id, this.actionData.text).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob)
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url)

        if (this.selectedProject) {
          this.saveAudioToProject(blob)
        } else {
          this.isGenerating = false
          this.generationSuccess = true
        }
      },
      error: (error) => {
        console.error("Error generating speech:", error)
        this.isGenerating = false
        this.generationError = "Failed to generate speech. Please try again."
      },
    })
  }

  saveAudioToProject(audioBlob: Blob) {
    if (!this.selectedProject || !this.selectedVoice) {
      this.isGenerating = false
      return
    }

    const formData = new FormData()
    formData.append("text", this.actionData.text)
    formData.append("statutAction", "EN_ATTENTE")
    formData.append("voiceUuid", this.selectedVoice.id)
    formData.append("utilisateurUuid", this.userId || "")
    formData.append("language", this.selectedVoice.language)
    formData.append("projectUuid", this.selectedProject.uuid)
    formData.append("audioGenerated", audioBlob, "audio.mp3")

    this.actionService.createAction(formData).subscribe({
      next: (response) => {
        console.log("Audio saved to project:", response)
        this.isGenerating = false
        this.generationSuccess = true
      },
      error: (error) => {
        console.error("Error saving audio to project:", error)
        this.isGenerating = false
        this.generationError = "Failed to save audio to project. Please try again."
      },
    })
  }

  proceedToCheckout() {
    if (!this.selectedVoice) return

    const checkoutData = {
      textLength: this.actionData.text.length,
      price: this.selectedVoice.price || this.price,
      totalPrice: (this.selectedVoice.price || this.price) * this.actionData.text.length,
      voiceId: this.selectedVoice.id,
      voiceName: this.selectedVoice.name,
    }

    this.router.navigate(["/checkout"], {
      state: {
        checkoutData: checkoutData,
        text: this.actionData.text,
        voiceSettings: {
          emotion: this.selectedEmotion,
          speed: this.vitess,
          sampleRate: this.rate,
          temperature: this.temperature,
        },
      },
    })
  }

  // UI methods
  toggleVoiceSelection() {
    this.showVoiceSelection = !this.showVoiceSelection
  }

  closeModal() {
    this.showVoiceSelection = false
    this.showVoice = true
  }

  getVoiceProfileImage(voice: Voice): string {
    if (voice.gender === "Male" || voice.gender === "male") {
      return "assets/img/male-voice-profile.jpg"
    } else if (voice.gender === "Female" || voice.gender === "female") {
      return "assets/img/female-voice-profile.jpg"
    } else {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${voice.name}`
    }
  }

  get volumeIcon(): string {
    if (this.isMuted || this.volume === 0) return "bi-volume-mute-fill"
    if (this.volume < 30) return "bi-volume-down-fill"
    if (this.volume < 70) return "bi-volume-up-fill"
    return "bi-volume-up-fill"
  }
}
