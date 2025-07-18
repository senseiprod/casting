import { Component,  ElementRef,  OnInit, ViewChild } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionService, ActionRequestLahajati } from "../../../services/action.service"
import  { TranslateService } from "@ngx-translate/core"
import  { VoiceElenlabsService } from "../../../services/voice-elenlabs.service"
import  { LahajatiService } from "../../../services/lahajati.service"
import  { PaypalService } from "src/app/services/paypal-service.service"
import  { ClientService } from "src/app/services/client-service.service"

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
}

// Interface for user balance
interface UserBalance {
  balance: number
  currency: string
}

// Interface for Bank Transfer Response
interface BankTransferResponse {
  actionId: number
  libelle: string
  rib: string
  price: number
  message: string
  bankName: string
  accountHolder: string
}

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
    dialect: "",
    performanceStyle: "",
  }

  // Balance-related properties
  userBalance: UserBalance = { balance: 0, currency: "USD" }
  balance = 0
  isLoadingBalance = false
  showBalanceOptions = false
  selectedBalanceOption: "use-balance" | "charge-balance" | "pay-direct" | null = null
  chargeAmount = 0
  isChargingBalance = false
  balanceError: string | null = null

  // Balance charging payment methods
  showBalanceChargeModal = false
  selectedChargeMethod: "card" | "paypal" | "verment" | null = null

  // Lahajati-specific properties
  lahajatiVoices: LahajatiVoice[] = []
  lahajatiDialects: any[] = []
  lahajatiPerformanceStyles: any[] = []
  selectedDialect = ""
  selectedPerformanceStyle = ""
  isLoadingLahajatiData = false
  lahajatiDataLoaded = false

  // CGV acceptance
  cgvAccepted = false

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

  // Bank transfer specific properties
  showBankTransferModal = false
  bankTransferDetails: BankTransferResponse | null = null
  bankTransferReference: string | null = null

  // Character limit modal
  showCharLimitModal = false
  userAcceptedPaidContent = false
  hasExceededLimit = false
  previousTextLength = 0

  languages = [
    { code: "darija", name: "Darija", active: false },
    { code: "ar", name: "Arabe", active: false },
    { code: "fr", name: "Français", active: false },
    { code: "en", name: "Anglais", active: true },
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

  constructor(
    private elevenLabsService: ElevenLabsService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
    private voix2Service: VoiceElenlabsService,
    private translate: TranslateService,
    private lahajatiService: LahajatiService,
    private paypalService: PaypalService,
    private clientService: ClientService,
  ) {
    this.generateWaveformBars()
  }

  ngOnInit(): void {
    // Get parent user ID
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
      if (this.userId) {
        this.loadUserBalance()
      }
    })

    // Get speaker voice UUID from current route
    this.route.paramMap.subscribe((params) => {
      const speakerVoiceUuid = params.get("uuid")

      if (speakerVoiceUuid) {
        this.loadSpeakerVoices(speakerVoiceUuid)
      } else {
        console.error("Speaker voice UUID not found in route, loading fallback voices.")
        this.loadFallbackVoices()
      }
    })

    this.fetchUserProjects()

    // Set up translation
    this.translate.setDefaultLang("en")
    const browserLang = this.translate.getBrowserLang()
    if (browserLang) {
      this.translate.use(browserLang.match(/en|fr|es/) ? browserLang : "en")
    }
  }

  // Load user balance
  loadUserBalance() {
    if (!this.userId) return

    this.isLoadingBalance = true
    this.clientService.getClientByUuid(this.userId).subscribe({
      next: (data) => {
        this.balance = data.balance || 0
        this.userBalance = { balance: this.balance, currency: "USD" }
        this.isLoadingBalance = false
        console.log("User balance loaded:", this.userBalance)
      },
      error: (error) => {
        console.error("Error loading user balance:", error)
        this.balance = 0
        this.userBalance = { balance: 0, currency: "USD" }
        this.isLoadingBalance = false
      },
    })
  }

  // Load speaker voices
  loadSpeakerVoices(speakerVoiceUuid: string) {
    this.voix2Service.getVoicesBySpeaker(speakerVoiceUuid).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.voices = data.map(
            (v): Voice => ({
              id: v.elevenlabs_id,
              name: v.name,
              gender: v.gender,
              ageZone: v.ageZone || "adult",
              type: v.typeVoice,
              language: v.language,
              avatar: v.avatar || this.getVoiceProfileImage({ name: v.name, gender: v.gender } as Voice),
              price: v.price,
              originalVoiceUrl: v.originalVoiceUrl || "",
              clonedVoiceUrl: v.elevenlabs_id,
            }),
          )

          this.filteredVoices = [...this.voices]
          this.selectedVoice = this.voices[0]
          this.showVoiceSelection = false
        } else {
          console.warn("No voices returned for this speaker. Loading fallback list.")
          this.loadFallbackVoices()
        }
      },
      error: (error) => {
        console.error("Error loading speaker voices:", error)
        this.loadFallbackVoices()
      },
    })
  }

  loadFallbackVoices() {
    this.elevenLabsService.listVoicesFiltter().subscribe({
      next: (voices: Voice[]) => {
        this.voices = voices
        this.filteredVoices = [...this.voices]
        this.selectedVoice = null
        this.showVoiceSelection = true
      },
      error: (error) => {
        console.error("Error retrieving fallback voices:", error)
        this.showVoiceSelection = true
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

    // Load Lahajati data if Darija voice is selected
    if (voice.language === "darija" && !this.lahajatiDataLoaded) {
      this.fetchLahajatiData()
    }
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

  // Lahajati data fetching
  fetchLahajatiData() {
    if (this.lahajatiDataLoaded || this.isLoadingLahajatiData) {
      return
    }

    this.isLoadingLahajatiData = true
    console.log("Fetching Lahajati voices...")

    this.lahajatiService.getVoices(1, 50).subscribe({
      next: (voicesResponse) => {
        try {
          const voicesData = typeof voicesResponse === "string" ? JSON.parse(voicesResponse) : voicesResponse
          this.lahajatiVoices = this.mapLahajatiVoices(voicesData.data || voicesData)
          console.log("Lahajati voices loaded:", this.lahajatiVoices)

          this.lahajatiService.getDialects(1, 50).subscribe({
            next: (dialectsResponse) => {
              const dialectsData =
                typeof dialectsResponse === "string" ? JSON.parse(dialectsResponse) : dialectsResponse
              this.lahajatiDialects = dialectsData.data || dialectsData
              console.log("Lahajati dialects loaded:", this.lahajatiDialects)

              this.lahajatiService.getPerformanceStyles(1, 50).subscribe({
                next: (stylesResponse) => {
                  const stylesData = typeof stylesResponse === "string" ? JSON.parse(stylesResponse) : stylesResponse
                  this.lahajatiPerformanceStyles = stylesData.data || stylesData
                  console.log("Performance styles loaded:", this.lahajatiPerformanceStyles)

                  this.lahajatiDataLoaded = true
                  this.isLoadingLahajatiData = false

                  if (this.filters.language === "darija") {
                    this.applyFilters()
                  }
                },
                error: (error) => {
                  console.error("Error fetching performance styles:", error)
                  this.isLoadingLahajatiData = false
                },
              })
            },
            error: (error) => {
              console.error("Error fetching dialects:", error)
              this.isLoadingLahajatiData = false
            },
          })
        } catch (error) {
          console.error("Error parsing voices:", error)
          this.isLoadingLahajatiData = false
        }
      },
      error: (error) => {
        console.error("Error fetching voices:", error)
        this.isLoadingLahajatiData = false
      },
    })
  }

  mapLahajatiVoices(lahajatiVoices: any[]): LahajatiVoice[] {
    return lahajatiVoices.map((voice) => ({
      id: voice.id_voice || voice.voice_id,
      name: voice.display_name || voice.voice_name,
      gender: voice.gender || "unknown",
      avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(voice.display_name),
      originalVoiceUrl: voice.sample_url || voice.preview_url,
      clonedVoiceUrl: voice.sample_url || voice.preview_url,
      price: voice.price || 0.05,
      type: "darija",
      language: "darija",
      ageZone: voice.age_zone || voice.age || "adult",
      dialect: voice.dialect,
      performanceStyle: voice.performance_style,
    }))
  }

  onDialectChange(event: any): void {
    const dialectId = event.target.value
    this.selectedDialect = dialectId
    this.filters.dialect = dialectId
    this.applyFilters()
  }

  onPerformanceStyleChange(event: any): void {
    const styleId = event.target.value
    this.selectedPerformanceStyle = styleId
    this.filters.performanceStyle = styleId
    this.applyFilters()
  }

  isDarijaSelected(): boolean {
    return this.filters.language === "darija"
  }

  // Filter methods
  applyFilters(): void {
    if (this.filters.language === "darija" && !this.lahajatiDataLoaded) {
      this.fetchLahajatiData()
      return
    }

    let voicesToFilter: any[] = []

    if (this.filters.language === "darija") {
      voicesToFilter = this.lahajatiVoices
    } else {
      voicesToFilter = this.voices
    }

    this.filteredVoices = voicesToFilter.filter(
      (voice) =>
        (this.filters.search === "" || voice.name.toLowerCase().includes(this.filters.search.toLowerCase())) &&
        (this.filters.gender === "" || voice.gender === this.filters.gender) &&
        (this.filters.ageZone === "" || voice.ageZone === this.filters.ageZone) &&
        (this.filters.type === "" || voice.type === this.filters.type) &&
        (this.filters.language === "" || voice.language === this.filters.language) &&
        (this.filters.dialect === "" || voice.dialect === this.filters.dialect) &&
        (this.filters.performanceStyle === "" || voice.performanceStyle === this.filters.performanceStyle),
    )

    this.currentPage = 1
  }

  resetFilters(): void {
    this.filters = {
      search: "",
      gender: "",
      ageZone: "",
      type: "",
      language: "",
      dialect: "",
      performanceStyle: "",
    }
    this.selectedDialect = ""
    this.selectedPerformanceStyle = ""
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
    this.paymentError = null
    this.balanceError = null
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

  checkTextLength(): void {
    const currentLength = this.actionData.text.length

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
    if (this.actionData.text.length > 100) {
      this.actionData.text = this.actionData.text.substring(0, 100)
    }
    this.showCharLimitModal = false
    this.previousTextLength = this.actionData.text.length
  }

  calculateTotal(): number {
    if (this.actionData.text.length <= 100) {
      return 0
    } else {
      return this.price * (this.actionData.text.length - 100)
    }
  }

  // Balance management
  hasSufficientBalance(): boolean {
    return this.userBalance.balance >= this.calculatedPrice
  }

  showPaymentMethodSelection() {
    this.calculatedPrice = this.price * this.actionData.text.length
    this.proceedToPaymentSelection()
  }

  private proceedToPaymentSelection() {
    console.log("Current balance:", this.userBalance.balance, "Calculated price:", this.calculatedPrice)

    if (this.userBalance.balance >= 0 || this.isLoadingBalance) {
      this.showBalanceOptions = true
    } else {
      this.showPaymentMethodModal = true
    }

    this.paymentError = null
    this.balanceError = null
  }

  selectBalanceOption(option: "use-balance" | "charge-balance" | "pay-direct") {
    this.selectedBalanceOption = option
    this.balanceError = null

    if (option === "charge-balance") {
      const minimumCharge = this.getMinimumChargeAmount()
      this.chargeAmount = minimumCharge

      setTimeout(() => {
        const input = document.getElementById("chargeAmount") as HTMLInputElement
        if (input) {
          input.value = this.chargeAmount.toString()
          console.log("Updated input value to:", input.value)
        }
      }, 100)
    }
  }

  onChargeAmountChange(event: any) {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value
    console.log("Charge amount changed to:", this.chargeAmount)
  }

  onChargeAmountBlur(event: any) {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value
    console.log("Charge amount blur, final value:", this.chargeAmount)

    const minimumAmount = this.getMinimumChargeAmount()
    if (this.chargeAmount < minimumAmount) {
      this.chargeAmount = minimumAmount
      event.target.value = this.chargeAmount.toString()
      console.log("Adjusted to minimum amount:", this.chargeAmount)
    }
  }

  proceedWithBalanceOption() {
    if (!this.selectedBalanceOption) {
      this.balanceError = "Please select a payment option"
      return
    }

    switch (this.selectedBalanceOption) {
      case "use-balance":
        if (!this.hasSufficientBalance()) {
          this.balanceError = "Insufficient balance. Please charge your account or pay directly."
          return
        }
        this.userBalance.balance -= this.calculatedPrice
        this.closeBalanceOptions()
        this.processAudioGeneration()
        break
      case "charge-balance":
        this.showBalanceChargeOptions()
        break
      case "pay-direct":
        this.closeBalanceOptions()
        this.showPaymentMethodModal = true
        break
    }
  }

  showBalanceChargeOptions() {
    this.proceedToBalanceCharge()
  }

  private proceedToBalanceCharge() {
    if (this.chargeAmount <= 0) {
      const minimumCharge = this.getMinimumChargeAmount()
      this.chargeAmount = minimumCharge
    }
    console.log("Showing balance charge options with amount:", this.chargeAmount)
    this.closeBalanceOptions()
    this.showBalanceChargeModal = true
    this.selectedChargeMethod = null

    setTimeout(() => {
      console.log("Charge amount after modal transition:", this.chargeAmount)
    }, 200)
  }

  selectChargeMethod(method: "card" | "paypal" | "verment") {
    this.selectedChargeMethod = method
  }

  closeBalanceChargeModal() {
    this.showBalanceChargeModal = false
    this.selectedChargeMethod = null
    this.balanceError = null
    this.resetChargeAmount()
  }

  proceedWithBalanceCharge() {
    console.log("=== PROCEEDING WITH BALANCE CHARGE ===")
    console.log("Selected charge method:", this.selectedChargeMethod)
    console.log("Current charge amount:", this.chargeAmount)

    if (!this.selectedChargeMethod) {
      this.balanceError = "Please select a charging method"
      return
    }

    const minimumAmount = this.getMinimumChargeAmount()
    console.log("Minimum amount required:", minimumAmount)

    if (this.chargeAmount < minimumAmount) {
      this.balanceError = `Minimum charge amount is $${minimumAmount.toFixed(2)}`
      return
    }

    if (this.chargeAmount <= 0) {
      this.balanceError = "Please enter a valid charge amount"
      return
    }

    this.executeBalanceCharge()
  }

  private executeBalanceCharge() {
    console.log("All validations passed. Proceeding with charge amount:", this.chargeAmount)

    this.isChargingBalance = true
    this.balanceError = null

    if (this.selectedChargeMethod === "paypal") {
      this.chargeBalanceWithPayPal()
    } else if (this.selectedChargeMethod === "card") {
      this.balanceError = "Credit card charging not implemented yet"
      this.isChargingBalance = false
    } else if (this.selectedChargeMethod === "verment") {
      this.chargeBalanceWithBankTransfer()
    }
  }

  closeBalanceOptions() {
    this.showBalanceOptions = false
    this.selectedBalanceOption = null
    this.balanceError = null
  }

  chargeBalanceWithPayPal() {
    if (!this.userId) {
      this.balanceError = "User ID not found"
      this.isChargingBalance = false
      return
    }

    console.log("Charging balance with PayPal, amount:", this.chargeAmount)

    this.paypalService.chargeBalance(this.userId, this.chargeAmount).subscribe({
      next: (response) => {
        console.log("PayPal balance charge response:", response)

        if (response.redirectUrl) {
          window.location.href = response.redirectUrl
        } else {
          this.balanceError = "Failed to initiate PayPal balance charging"
          this.isChargingBalance = false
        }
      },
      error: (error) => {
        console.error("Error charging balance with PayPal:", error)
        this.balanceError = error.error?.message || "Failed to charge balance with PayPal"
        this.isChargingBalance = false
      },
    })
  }

  chargeBalanceWithBankTransfer() {
    if (!this.userId) {
      this.balanceError = "User ID not found"
      this.isChargingBalance = false
      return
    }

    console.log("Charging balance with bank transfer, amount:", this.chargeAmount)

    this.paypalService.createBankTransfer(this.userId, this.chargeAmount).subscribe({
      next: (response: any) => {
        console.log("Bank transfer balance charge response:", response)

        this.bankTransferDetails = response
        this.bankTransferReference = response.libelle

        this.isChargingBalance = false
        this.closeBalanceChargeModal()

        this.showBankTransferModal = true
      },
      error: (error) => {
        console.error("Error charging balance with bank transfer:", error)
        this.balanceError = error.error?.message || "Failed to charge balance with bank transfer"
        this.isChargingBalance = false
      },
    })
  }

  resetChargeAmount() {
    this.chargeAmount = 0
    console.log("Charge amount reset to:", this.chargeAmount)
  }

  getMinimumChargeAmount(): number {
    const deficit = Math.max(0, this.calculatedPrice - this.userBalance.balance)
    const minimumCharge = Math.max(deficit, 10)
    console.log(
      "Calculated minimum charge:",
      minimumCharge,
      "Deficit:",
      deficit,
      "Calculated price:",
      this.calculatedPrice,
      "Balance:",
      this.userBalance.balance,
    )
    return minimumCharge
  }

  // Payment methods
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

    this.executeSelectedPayment()
  }

  private executeSelectedPayment() {
    if (this.selectedPaymentMethod === "paypal") {
      this.processPayPalPayment()
    } else if (this.selectedPaymentMethod === "card") {
      this.paymentError = "Card payment not implemented yet"
    } else if (this.selectedPaymentMethod === "verment") {
      this.processBankTransferPayment()
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

    const actionRequest: ActionRequestLahajati = {
      text: this.actionData.text,
      voiceUuid: this.selectedVoice.id,
      utilisateurUuid: this.userId,
      language: this.selectedVoice.language,
      projectUuid:
        this.selectedProject?.uuid ||
        "331db4d304bb5949345f1bd8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d3",
      ...(this.selectedVoice.language === "darija" && {
        dialectId: this.selectedDialect || "35",
        performanceId: this.selectedPerformanceStyle || "1284",
      }),
    }

    const paymentObservable =
      this.selectedVoice.language === "darija"
        ? this.actionService.createActionWithPaypal(actionRequest)
        : this.actionService.createActionPayed(actionRequest)

    paymentObservable.subscribe(
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

          if (response.testUrl) {
            console.log("Test URL available:", response.testUrl)
          }
        } else if (this.approvalUrl) {
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

  processBankTransferPayment() {
    if (!this.selectedVoice || !this.userId) {
      this.paymentError = "Missing required information"
      return
    }

    this.isProcessingPayment = true
    this.paymentError = null
    this.showPaymentProcessing = true

    const bankTransferRequest = {
      text: this.actionData.text,
      voiceUuid: this.selectedVoice.id,
      utilisateurUuid: this.userId,
      language: this.selectedVoice.language,
      projectUuid: this.selectedProject?.uuid || "331db4d304bb5949345f1bd8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d3",
      ...(this.selectedVoice.language === "darija" && {
        dialectId: this.selectedDialect || "35",
        performanceId: this.selectedPerformanceStyle || "1284",
      }),
    }

    const bankTransferObservable =
      this.selectedVoice.language === "darija"
        ? this.actionService.createActionLahajatiWithBankTransfer(bankTransferRequest)
        : this.actionService.createActionWithBankTransfer(bankTransferRequest)

    bankTransferObservable.subscribe(
      (response: BankTransferResponse) => {
        console.log("Bank transfer payment response:", response)

        this.actionId = response.actionId
        this.bankTransferReference = response.libelle
        this.bankTransferDetails = response
        this.calculatedPrice = response.price

        this.isProcessingPayment = false
        this.showPaymentProcessing = false
        this.closePaymentMethodModal()

        this.showBankTransferModal = true
      },
      (error) => {
        console.error("Error creating bank transfer payment:", error)
        this.paymentError = error.error?.error || "Failed to process bank transfer payment"
        this.isProcessingPayment = false
        this.showPaymentProcessing = false
      },
    )
  }

  closeBankTransferModal() {
    this.showBankTransferModal = false
    this.bankTransferDetails = null
    this.bankTransferReference = null
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard:", text)
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
  }

  confirmBankTransferPayment() {
    if (this.actionId) {
      console.log("Bank transfer payment confirmed for action:", this.actionId)
      this.closeBankTransferModal()

      this.generationSuccess = true
      this.generationError = null
    }
  }

  redirectToPayPal() {
    if (this.approvalUrl) {
      this.closePaymentMethodModal()
      this.showPaymentProcessing = false
      window.location.href = this.approvalUrl
    }
  }

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
    this.startAudioGeneration()
  }

  startAudioGeneration() {
    this.showGenerationProgress = true
    this.generationProgress = 0
    this.isGenerating = true

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
    console.log("Audio generation completed for action:", this.actionId)
  }

  retryPayment() {
    this.paymentError = null
    this.isProcessingPayment = false
    this.showPaymentProcessing = false
    this.showPaymentMethodModal = true
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
      this.showPaymentMethodSelection()
    }
  }

  processAudioGeneration() {
    this.isGenerating = true
    this.generationError = null
    this.generationSuccess = false

    if (this.selectedVoice!.language === "darija") {
      this.generateDarijaAudio()
    } else {
      this.elevenLabsService.textToSpeech(this.selectedVoice!.id, this.actionData.text).subscribe(
        (blob) => {
          const url = URL.createObjectURL(blob)
          this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url)

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
  }

  generateDarijaAudio() {
    const requestBody = {
      text: this.actionData.text,
      id_voice: this.selectedVoice!.id,
      dialect_id: this.selectedDialect || "35",
      performance_id: this.selectedPerformanceStyle || "1284",
      input_mode: "0",
    }

    this.lahajatiService.generateSpeech(requestBody).subscribe(
      (blob) => {
        const url = URL.createObjectURL(blob)
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url)

        if (this.selectedProject) {
          this.saveAudioToProject(blob)
        } else {
          this.isGenerating = false
          this.generationSuccess = true
        }
      },
      (error) => {
        console.error("Error generating Darija speech:", error)
        this.isGenerating = false
        this.generationError = "Failed to generate Darija speech. Please try again."
      },
    )
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

    if (this.selectedVoice.language === "darija") {
      if (this.selectedDialect) {
        formData.append("dialect", this.selectedDialect)
      }
      if (this.selectedPerformanceStyle) {
        formData.append("performanceStyle", this.selectedPerformanceStyle)
      }
    }

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
