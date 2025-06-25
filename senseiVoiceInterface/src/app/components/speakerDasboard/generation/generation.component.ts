import { Component,  ElementRef, ViewChild,  OnInit } from "@angular/core"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionService } from "../../../services/action.service"
import  { ActivatedRoute, Router } from "@angular/router"

@Component({
  selector: "app-generation",
  templateUrl: "./generation.component.html",
  styleUrls: ["./generation.component.css"],
})
export class GenerationComponent implements OnInit {
  voices: Voice[] = []
  filteredVoices: Voice[] = []
  selectedVoice: Voice | null = null
  audio = new Audio()
  showVoiceSelection = true
  showVoice = false
  currentPage = 1
  voicesPerPage = 3
  emotions = ["neutral", "happy", "sad", "angry"]
  selectedEmotion = "Neutral"
  vitess = 1.0
  rate = 44100
  temperature = 1.0
  actionData = { text: "The senseiprod voice generator can deliver high-quality, human-like speech in 32 languages." }
  price = 0.05 // Example price per character
  baseUrl = "https://api.voice-service.com"
  audioUrl: SafeUrl | null = null
  audioPlayer = new Audio()
  voiceId = "sarah_voice"
  userId: string | null = ""
  languages = [
    { code: "en", name: "Anglais", active: true },
    { code: "fr", name: "Français", active: false },
    { code: "ar", name: "Arabe", active: false },
    { code: "de", name: "Allemand", active: false },
    { code: "es", name: "Espagnol", active: false },
    { code: "tr", name: "Turc", active: false },
    { code: "it", name: "Italien", active: false },
    { code: "pt", name: "Portugais", active: false },
    { code: "hi", name: "Hindi", active: false },
    { code: "bn", name: "Bengali", active: false },
    { code: "ru", name: "Russe", active: false },
    { code: "ja", name: "Japonais", active: false },
    { code: "ko", name: "Coréen", active: false },
    { code: "zh", name: "Chinois", active: false },
    { code: "vi", name: "Vietnamien", active: false },
    { code: "pl", name: "Polonais", active: false },
    { code: "uk", name: "Ukrainien", active: false },
    { code: "ro", name: "Roumain", active: false },
    { code: "nl", name: "Néerlandais", active: false },
    { code: "sv", name: "Suédois", active: false },
    { code: "fi", name: "Finnois", active: false },
    { code: "no", name: "Norvégien", active: false },
    { code: "da", name: "Danois", active: false },
    { code: "hu", name: "Hongrois", active: false },
    { code: "cs", name: "Tchèque", active: false },
    { code: "el", name: "Grec", active: false },
    { code: "th", name: "Thaï", active: false },
    { code: "id", name: "Indonésien", active: false },
    { code: "ms", name: "Malais", active: false },
    { code: "he", name: "Hébreu", active: false },
    { code: "fa", name: "Persan", active: false },
  ]

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

  // Audio player properties
  @ViewChild("audioPlayer") audioPlayerRef!: ElementRef<HTMLAudioElement>
  isAudioPlaying = false
  currentTime = 0
  duration = 0
  volume = 100
  isMuted = false
  progressPercentage = 0
  waveformBars: number[] = []

  // Add these properties to your component class
  showCharLimitModal = false
  userAcceptedPaidContent = false
  hasExceededLimit = false
  previousTextLength = 0

  // Payment related properties
  showPaymentMethodModal = false
  selectedPaymentMethod: "card" | "paypal" | "verment" | null = null
  isProcessingPayment = false
  paymentError: string | null = null
  calculatedPrice = 0
  actionId: number | null = null
  paymentId: string | null = null
  approvalUrl: string | null = null
  showPaymentProcessing = false
  showGenerationProgress = false
  generationProgress = 0

  constructor(
    private elevenLabsService: ElevenLabsService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
  ) {}

  // Initialize waveform bars in ngOnInit
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })
    this.fetchVoices()
    this.fetchUserProjects()

    // Initialize waveform bars
    this.waveformBars = Array.from({ length: 20 }, () => Math.random() * 80 + 20)
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
    this.paymentError = null
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
    // For audio request, show payment method selection
    else if (this.activeTab === "request") {
      this.showPaymentMethodSelection()
    }
  }

  showPaymentMethodSelection() {
    // Calculate price
    this.calculatedPrice = this.price * this.actionData.text.length
    this.showPaymentMethodModal = true
    this.paymentError = null
  }

  selectPaymentMethod(method: "card" | "paypal" | "verment") {
    this.selectedPaymentMethod = method
  }

  closePaymentMethodModal() {
    this.showPaymentMethodModal = false
    this.selectedPaymentMethod = null
    this.paymentError = null
  }

  proceedWithPayment() {
    if (!this.selectedPaymentMethod) {
      this.paymentError = "Please select a payment method"
      return
    }

    if (this.selectedPaymentMethod === "paypal") {
      this.processPayPalPayment()
    } else if (this.selectedPaymentMethod === "card") {
      // Handle card payment - you can implement this later
      this.paymentError = "Card payment not implemented yet"
    } else if (this.selectedPaymentMethod === "verment") {
      // Handle verment payment - you can implement this later
      this.paymentError = "Verment payment not implemented yet"
    }
  }

  processPayPalPayment() {
    if (!this.selectedVoice || !this.userId) {
      this.paymentError = "Missing required information"
      return
    }

    this.isProcessingPayment = true
    this.paymentError = null
    this.showPaymentProcessing = true

    // Create action request
    const actionRequest = {
      text: this.actionData.text,
      voiceUuid: this.selectedVoice.id,
      utilisateurUuid: this.userId,
      language: this.selectedVoice.language,
      projectUuid: this.selectedProject?.uuid || "331db4d304bb5949345f1bd8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d3",
    }

    this.actionService.createActionPayed(actionRequest).subscribe(
      (response) => {
        console.log("PayPal payment response:", response)

        this.actionId = response.actionId
        this.paymentId = response.paymentId
        this.approvalUrl = response.approvalUrl
        this.calculatedPrice = response.price

        if (response.paypalError) {
          this.paymentError = response.paypalError
          this.isProcessingPayment = false
          this.showPaymentProcessing = false

          // For testing, you can use the test URL
          if (response.testUrl) {
            console.log("Test URL available:", response.testUrl)
          }
        } else if (this.approvalUrl) {
          // Redirect to PayPal for payment approval
          this.redirectToPayPal()
        } else {
          this.paymentError = "Failed to create PayPal payment"
          this.isProcessingPayment = false
          this.showPaymentProcessing = false
        }
      },
      (error) => {
        console.error("Error creating PayPal payment:", error)
        this.paymentError = error.error?.error || "Failed to process payment"
        this.isProcessingPayment = false
        this.showPaymentProcessing = false
      },
    )
  }

  redirectToPayPal() {
    if (this.approvalUrl) {
      // Close modals before redirect
      this.closePaymentMethodModal()
      this.showPaymentProcessing = false

      // Redirect to PayPal
      window.location.href = this.approvalUrl
    }
  }

  // For testing purposes - bypass PayPal
  testPaymentSuccess() {
    if (this.actionId) {
      this.actionService.testSuccess(this.actionId).subscribe(
        (response) => {
          console.log("Test payment success:", response)
          this.handlePaymentSuccess()
        },
        (error) => {
          console.error("Test payment error:", error)
          this.paymentError = "Test payment failed"
        },
      )
    }
  }

  handlePaymentSuccess() {
    this.isProcessingPayment = false
    this.showPaymentProcessing = false
    this.closePaymentMethodModal()

    // Start generation process
    this.startAudioGeneration()
  }

  startAudioGeneration() {
    this.showGenerationProgress = true
    this.generationProgress = 0
    this.isGenerating = true

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      this.generationProgress += 10
      if (this.generationProgress >= 100) {
        clearInterval(progressInterval)
        this.completeGeneration()
      }
    }, 500)
  }

  completeGeneration() {
    this.showGenerationProgress = false
    this.isGenerating = false
    this.generationSuccess = true

    // Here you would typically get the generated audio from the backend
    // For now, we'll simulate it
    console.log("Audio generation completed for action:", this.actionId)
  }

  retryPayment() {
    this.paymentError = null
    this.isProcessingPayment = false
    this.showPaymentProcessing = false
    this.showPaymentMethodModal = true
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
    formData.append("utilisateurUuid", this.userId)
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

  fetchVoices() {
    this.elevenLabsService.listVoicesFiltter().subscribe(
      (voices: Voice[]) => {
        this.voices = voices
        this.filteredVoices = this.voices
        console.log("Voices retrieved:", this.voices)
      },
      (error) => {
        console.error("Error retrieving voices:", error)
      },
    )
  }

  filters = {
    search: "",
    gender: "",
    ageZone: "",
    type: "",
    language: "",
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

  playOriginalVoice(voice: Voice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.originalVoiceUrl) {
      this.stopVoice() // Stop if the same audio is playing
    } else {
      this.stopVoice() // Stop any previous audio
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

  // Audio player methods
  togglePlayPause(): void {
    if (!this.audioPlayerRef?.nativeElement) return

    const audio = this.audioPlayerRef.nativeElement

    if (this.isAudioPlaying) {
      audio.pause()
      this.isAudioPlaying = false
    } else {
      audio
        .play()
        .then(() => {
          this.isAudioPlaying = true
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
          this.generationError = "Failed to play audio. Please try again."
        })
    }
  }

  onAudioLoaded(): void {
    if (this.audioPlayerRef?.nativeElement) {
      this.duration = this.audioPlayerRef.nativeElement.duration
      this.setVolume({ target: { value: this.volume } } as any)
    }
  }

  onTimeUpdate(): void {
    if (this.audioPlayerRef?.nativeElement) {
      this.currentTime = this.audioPlayerRef.nativeElement.currentTime
      this.progressPercentage = (this.currentTime / this.duration) * 100
    }
  }

  onAudioEnded(): void {
    this.isAudioPlaying = false
    this.currentTime = 0
    this.progressPercentage = 0
  }

  onAudioError(event: any): void {
    console.error("Audio error:", event)
    this.isAudioPlaying = false
    this.generationError = "Error playing audio. Please try again."
  }

  seekAudio(event: MouseEvent): void {
    if (!this.audioPlayerRef?.nativeElement) return

    const progressContainer = event.currentTarget as HTMLElement
    const rect = progressContainer.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = (clickX / rect.width) * 100
    const newTime = (percentage / 100) * this.duration

    this.audioPlayerRef.nativeElement.currentTime = newTime
    this.currentTime = newTime
    this.progressPercentage = percentage
  }

  setVolume(event: any): void {
    if (!this.audioPlayerRef?.nativeElement) return

    this.volume = Number.parseInt(event.target.value)
    this.audioPlayerRef.nativeElement.volume = this.volume / 100
    this.isMuted = this.volume === 0
  }

  toggleMute(): void {
    if (!this.audioPlayerRef?.nativeElement) return

    if (this.isMuted) {
      this.volume = 50
      this.audioPlayerRef.nativeElement.volume = 0.5
      this.isMuted = false
    } else {
      this.volume = 0
      this.audioPlayerRef.nativeElement.volume = 0
      this.isMuted = true
    }
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00"

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  get volumeIcon(): string {
    if (this.isMuted || this.volume === 0) return "bi-volume-mute-fill"
    if (this.volume < 30) return "bi-volume-down-fill"
    if (this.volume < 70) return "bi-volume-up-fill"
    return "bi-volume-up-fill"
  }

  // Getter for paginated voices
  get paginatedVoices() {
    const startIndex = (this.currentPage - 1) * this.voicesPerPage
    return this.filteredVoices.slice(startIndex, startIndex + this.voicesPerPage)
  }

  // Methods for changing page
  nextPage() {
    if (this.currentPage < Math.ceil(this.filteredVoices.length / this.voicesPerPage)) {
      this.currentPage++
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
    }
  }

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
