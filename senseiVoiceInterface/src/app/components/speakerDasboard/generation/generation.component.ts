import { Component,  ElementRef, ViewChild, OnInit } from "@angular/core"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionRequestLahajati, ActionService } from "../../../services/action.service"
import  { ActivatedRoute, Router } from "@angular/router"
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

  // Existing properties...
  lahajatiVoices: LahajatiVoice[] = []
  lahajatiDialects: any[] = []
  lahajatiPerformanceStyles: any[] = []
  selectedDialect = ""
  selectedPerformanceStyle = ""
  isLoadingLahajatiData = false
  lahajatiDataLoaded = false

  showCgvModal = false
  cgvAccepted = false
  pendingPaymentAction: (() => void) | null = null

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

  constructor(
    private elevenLabsService: ElevenLabsService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
    private lahajatiService: LahajatiService,
    private paypalService: PaypalService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
      if (this.userId) {
        this.loadUserBalance()
      }
    })
    this.fetchVoices()
    this.fetchUserProjects()
    this.waveformBars = Array.from({ length: 20 }, () => Math.random() * 80 + 20)
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

  // Check if user has sufficient balance
  hasSufficientBalance(): boolean {
    return this.userBalance.balance >= this.calculatedPrice
  }

  // Show balance options when generating paid content
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

  // CGV Modal handlers
  onCgvAccepted() {
    this.cgvAccepted = true
    this.showCgvModal = false

    // Execute the pending payment action
    if (this.pendingPaymentAction) {
      this.pendingPaymentAction()
      this.pendingPaymentAction = null
    }
  }

  onCgvClosed() {
    this.showCgvModal = false
    this.pendingPaymentAction = null
    // Reset any payment-related states
    this.paymentError = null
    this.balanceError = null
  }

  // Modified balance charge methods to also check CGV
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
  // Select balance option
  selectBalanceOption(option: "use-balance" | "charge-balance" | "pay-direct") {
    this.selectedBalanceOption = option
    this.balanceError = null

    if (option === "charge-balance") {
      // Calculate minimum charge amount (current cost + some buffer)
      const minimumCharge = this.getMinimumChargeAmount()
      this.chargeAmount = minimumCharge // Remove the Math.max(minimumCharge, 10) since getMinimumChargeAmount already handles the minimum
      console.log("Setting initial charge amount to:", this.chargeAmount) // Debug log

      // Force update the input value after a short delay to ensure DOM is ready
      setTimeout(() => {
        const input = document.getElementById("chargeAmount") as HTMLInputElement
        if (input) {
          input.value = this.chargeAmount.toString()
          console.log("Updated input value to:", input.value)
        }
      }, 100)
    }
  }

  // Handle charge amount input changes
  onChargeAmountChange(event: any) {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value
    console.log("Charge amount changed to:", this.chargeAmount)
  }

  // Handle charge amount blur event
  onChargeAmountBlur(event: any) {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value
    console.log("Charge amount blur, final value:", this.chargeAmount)

    // Validate minimum amount
    const minimumAmount = this.getMinimumChargeAmount()
    if (this.chargeAmount < minimumAmount) {
      this.chargeAmount = minimumAmount
      event.target.value = this.chargeAmount.toString()
      console.log("Adjusted to minimum amount:", this.chargeAmount)
    }
  }

  // Proceed with selected balance option
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
        // Deduct from balance and proceed with generation
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

  // Show balance charge options

  // Select charge method
  selectChargeMethod(method: "card" | "paypal" | "verment") {
    this.selectedChargeMethod = method
  }

  // Close balance charge modal
  closeBalanceChargeModal() {
    this.showBalanceChargeModal = false
    this.selectedChargeMethod = null
    this.balanceError = null
    this.resetChargeAmount() // Reset only when closing this modal
  }

  // Proceed with balance charging
  proceedWithBalanceCharge() {
    console.log("=== PROCEEDING WITH BALANCE CHARGE ===")
    console.log("Selected charge method:", this.selectedChargeMethod)
    console.log("Current charge amount:", this.chargeAmount)
    console.log("Charge amount type:", typeof this.chargeAmount)

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

    // Check if CGV has been accepted for this session
    if (!this.cgvAccepted) {
      // Store the payment action to execute after CGV acceptance
      this.pendingPaymentAction = () => {
        this.executeBalanceCharge()
      }
      this.showCgvModal = true
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

  // Close balance options modal
  closeBalanceOptions() {
    this.showBalanceOptions = false
    this.selectedBalanceOption = null
    this.balanceError = null
    // DON'T reset chargeAmount here - keep it for the next modal
    // this.chargeAmount = 0  // Remove this line
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
          // Redirect to PayPal for balance charging
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

  // Charge balance with bank transfer
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

        // Store the bank transfer details
        this.bankTransferDetails = response
        this.bankTransferReference = response.libelle // Using libelle as reference

        this.isChargingBalance = false
        this.closeBalanceChargeModal()

        // Show bank transfer details modal
        this.showBankTransferModal = true
      },
      error: (error) => {
        console.error("Error charging balance with bank transfer:", error)
        this.balanceError = error.error?.message || "Failed to charge balance with bank transfer"
        this.isChargingBalance = false
      },
    })
  }

  // Reset charge amount only when completely canceling the process
  resetChargeAmount() {
    this.chargeAmount = 0
    console.log("Charge amount reset to:", this.chargeAmount)
  }

  // Modified generateSpeech method
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
    // For audio request, show balance/payment options
    else if (this.activeTab === "request") {
      this.showPaymentMethodSelection()
    }
  }

  // Get minimum charge amount
  getMinimumChargeAmount(): number {
    const deficit = Math.max(0, this.calculatedPrice - this.userBalance.balance)
    const minimumCharge = Math.max(deficit, 10) // At least $10 or the deficit amount
    console.log(
      "Calculated minimum charge:",
      minimumCharge,
      "Deficit:",
      deficit,
      "Calculated price:",
      this.calculatedPrice,
      "Balance:",
      this.userBalance.balance,
    ) // Debug log
    return minimumCharge
  }

  // Rest of existing methods remain the same...
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
    this.balanceError = null
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

    // Check if CGV has been accepted for this session
    if (!this.cgvAccepted) {
      // Store the payment action to execute after CGV acceptance
      this.pendingPaymentAction = () => {
        this.executeSelectedPayment()
      }
      this.showCgvModal = true
      return
    }

    this.executeSelectedPayment()
  }

  private executeSelectedPayment() {
    if (this.selectedPaymentMethod === "paypal") {
      this.processPayPalPayment()
    } else if (this.selectedPaymentMethod === "card") {
      // Handle card payment - you can implement this later
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

    // Create action request
    const actionRequest : ActionRequestLahajati = {
      text: this.actionData.text,
      voiceUuid: this.selectedVoice.id,
      utilisateurUuid: this.userId,
      language: this.selectedVoice.language,
      projectUuid:
        this.selectedProject?.uuid ||
        "331db4d304bb5949345f1bd8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d3",
      // Add Darija-specific parameters if applicable
      ...(this.selectedVoice.language === "darija" && {
        dialectId: this.selectedDialect || "35",
        performanceId: this.selectedPerformanceStyle || "1284",
      }),
    }

    // Use appropriate service method based on voice language
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

  // Updated method for bank transfer payment with new response structure
  processBankTransferPayment() {
    if (!this.selectedVoice || !this.userId) {
      this.paymentError = "Missing required information"
      return
    }

    this.isProcessingPayment = true
    this.paymentError = null
    this.showPaymentProcessing = true

    // Create bank transfer request
    const bankTransferRequest = {
      text: this.actionData.text,
      voiceUuid: this.selectedVoice.id,
      utilisateurUuid: this.userId,
      language: this.selectedVoice.language,
      projectUuid: this.selectedProject?.uuid || "331db4d304bb5949345f1bd8d0325b19a85b5536e0dc6d6f6a9d3c154813d8d3",
      // Add Darija-specific parameters if applicable
      ...(this.selectedVoice.language === "darija" && {
        dialectId: this.selectedDialect || "35",
        performanceId: this.selectedPerformanceStyle || "1284",
      }),
    }

    // Use appropriate service method based on voice language
    const bankTransferObservable =
      this.selectedVoice.language === "darija"
        ? this.actionService.createActionLahajatiWithBankTransfer(bankTransferRequest)
        : this.actionService.createActionWithBankTransfer(bankTransferRequest)

    bankTransferObservable.subscribe(
      (response: BankTransferResponse) => {
        console.log("Bank transfer payment response:", response)

        this.actionId = response.actionId
        this.bankTransferReference = response.libelle // Using libelle as reference
        this.bankTransferDetails = response
        this.calculatedPrice = response.price

        this.isProcessingPayment = false
        this.showPaymentProcessing = false
        this.closePaymentMethodModal()

        // Show bank transfer details modal
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

  // Method to close bank transfer modal
  closeBankTransferModal() {
    this.showBankTransferModal = false
    this.bankTransferDetails = null
    this.bankTransferReference = null
  }

  // Method to copy bank details to clipboard
  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You can show a toast notification here
        console.log("Copied to clipboard:", text)
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
  }

  // Method to confirm bank transfer payment (for manual verification)
  confirmBankTransferPayment() {
    if (this.actionId) {
      // This could trigger a manual verification process
      // or mark the payment as pending verification
      console.log("Bank transfer payment confirmed for action:", this.actionId)
      this.closeBankTransferModal()

      // You might want to show a success message or redirect
      this.generationSuccess = true
      this.generationError = null
    }
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

    // Check if it's a Darija voice and use Lahajati service
    if (this.selectedVoice!.language === "darija") {
      this.generateDarijaAudio()
    } else {
      // Use ElevenLabs service for other languages
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
  }

  // New method for Darija audio generation
  generateDarijaAudio() {
    const requestBody = {
      text: this.actionData.text,
      id_voice: this.selectedVoice!.id,
      dialect_id: this.selectedDialect || "35", // Use selected dialect or default
      performance_id: this.selectedPerformanceStyle || "1284", // Use selected performance or default
      input_mode: "0",
    }

    this.lahajatiService.generateSpeech(requestBody).subscribe(
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

    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append("text", this.actionData.text)
    formData.append("statutAction", "EN_ATTENTE")
    formData.append("voiceUuid", this.selectedVoice.id)
    formData.append("utilisateurUuid", this.userId)
    formData.append("language", this.selectedVoice.language)
    formData.append("projectUuid", this.selectedProject.uuid)
    formData.append("audioGenerated", audioBlob, "audio.mp3")

    // Add Darija-specific parameters if applicable
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

  // Rest of existing methods for voice selection, filters, audio player, etc.
  fetchVoices(pageSize: number = 100,
    gender: string | null = null,
    age: string | null = null,
    language: string | null = null,
    nextPageToken: number = 1,) {
    this.elevenLabsService.listVoicesFiltter(pageSize,gender,age,language,nextPageToken).subscribe(
      (voices: Voice[]) => {
        console.log("Voices retrieved:", voices)
        this.voices = voices
        this.filteredVoices = this.voices
        console.log("Voices retrieved:", this.voices)
      },
      (error) => {
        console.error("Error retrieving voices:", error)
      },
    )
  }

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

  get paginatedVoices() {
    const startIndex = (this.currentPage - 1) * this.voicesPerPage
    return this.filteredVoices.slice(startIndex, startIndex + this.voicesPerPage)
  }

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

  // Add other existing methods as needed...
  filters = {
    search: "",
    gender: "",
    ageZone: "",
    type: "",
    language: "",
    dialect: "",
    performanceStyle: "",
  }

  applyFilters(): void {
    if (this.filters.language === "darija" && !this.lahajatiDataLoaded) {
      this.fetchLahajatiData()
      return
    }

    let voicesToFilter: any[] = []

    if (this.filters.language === "darija") {
      voicesToFilter = this.lahajatiVoices
    } else {
      this.fetchVoices(
        100,
        this.filters.gender,
        this.filters.ageZone,
        this.filters.language,
        1 
      )
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

  selectVoice(voice: Voice | LahajatiVoice): void {
    this.selectedVoice = voice as Voice
    this.price = voice.price || this.price

    // Load Lahajati data if Darija voice is selected
    if (voice.language === "darija" && !this.lahajatiDataLoaded) {
      this.fetchLahajatiData()
    }
  }

  closeModal() {
    this.showVoiceSelection = false
    this.showVoice = true
  }

  toggleVoiceSelection() {
    this.showVoiceSelection = !this.showVoiceSelection
  }

  playOriginalVoice(voice: Voice | LahajatiVoice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.originalVoiceUrl) {
      this.stopVoice()
    } else {
      this.stopVoice()
      this.audio = new Audio(voice.originalVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing original voice:", error))
    }
  }

  playClonedVoice(voice: Voice | LahajatiVoice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.clonedVoiceUrl) {
      this.stopVoice()
    } else {
      this.stopVoice()
      this.audio = new Audio(voice.clonedVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing cloned voice:", error))
    }
  }

  stopVoice(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = new Audio()
    }
  }
}
