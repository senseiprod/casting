import { Component,  OnInit } from "@angular/core"
import  { VoixResponse } from "../../../services/voix.service"
import { ClientResponse,  ClientService } from "../../../services/client-service.service"
import  { ActivatedRoute } from "@angular/router"
import  { UtilisateurService } from "../../../services/utilisateur-service.service"
import  { Router } from "@angular/router"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { TranslateService } from "@ngx-translate/core"
import  { AuthService } from "../../../services/auth.service"
import  { TranslationService, Language } from "../../../services/translation.service"
import  { PaypalService } from "src/app/services/paypal-service.service"

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit {
  voices: VoixResponse[] = []
  userId: string | null = ""
  audio = ""
  speaker: ClientResponse = new ClientResponse()
  errorMessage: string | null = null
  photoUrl: string | ArrayBuffer | null = null
  id = 0
  profilePhotoUrl: SafeUrl | null = null
  notificationCount = 3
  notifications: any[] = []

  // Balance related properties
  userBalance = 0
  isLoadingBalance = false
  balanceError: string | null = null
  showBalanceDetails = false

  // Balance charging properties
  showBalanceChargeModal = false
  selectedChargeMethod: "card" | "paypal" | "verment" | null = null
  chargeAmount = 0
  isChargingBalance = false
  chargeError: string | null = null

  // Payment processing properties
  isProcessingPayment = false
  paymentError: string | null = null
  showPaymentProcessing = false

  // CGV Modal properties - Added from generation component
  showCgvModal = false
  cgvAccepted = false
  pendingPaymentAction: (() => void) | null = null

  constructor(
    private route: ActivatedRoute,
    private speakerService: ClientService,
    private utilisateurService: UtilisateurService,
    public translate: TranslateService,
    private translationService: TranslationService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private paypalService: PaypalService,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get("uuid")
    this.loadUserData()
    this.loadNotifications()
    this.initializeTranslations()
    this.loadUserBalance()
  }

  private loadUserData(): void {
    if (this.userId) {
      this.speakerService.getClientByUuid(this.userId).subscribe(
        (data) => {
          console.log(data)
          this.speaker = data
          if (data.balance !== undefined) {
            this.userBalance = data.balance
          }
        },
        (error) => {
          this.errorMessage = "Error fetching speaker details"
          console.error("Error loading user data:", error)
        },
      )

      this.loadUserPhoto(this.userId)
    }
  }

  private loadUserBalance(): void {
    if (!this.userId) return

    this.isLoadingBalance = true
    this.balanceError = null

    this.speakerService.getClientByUuid(this.userId).subscribe({
      next: (data) => {
        this.userBalance = data.balance || 0
        this.isLoadingBalance = false
        console.log("User balance loaded:", this.userBalance)
      },
      error: (error) => {
        console.error("Error loading user balance:", error)
        this.balanceError = "Failed to load balance"
        this.userBalance = 0
        this.isLoadingBalance = false
      },
    })
  }

  refreshBalance(): void {
    this.loadUserBalance()
  }

  toggleBalanceDetails(): void {
    this.showBalanceDetails = !this.showBalanceDetails
  }

  navigateToWallet(): void {
    this.router.navigate([`/client/${this.userId}/wallet`])
  }

  // Navigation methods
  navigateToHome(): void {
    if (this.userId) {
      this.router.navigate([`https://castingvoixoff.ma/`])
    } else {
      this.router.navigate(["/"])
    }
  }

  formatBalance(balance: number): string {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(balance)
  }

  getBalanceStatusClass(): string {
    if (this.userBalance <= 0) return "balance-empty"
    if (this.userBalance < 50) return "balance-low"
    if (this.userBalance < 200) return "balance-medium"
    return "balance-good"
  }

  getBalanceStatusText(): string {
    if (this.userBalance <= 0) return "header.balance.status.empty"
    if (this.userBalance < 50) return "header.balance.status.low"
    if (this.userBalance < 200) return "header.balance.status.medium"
    return "balance-good"
  }

  // CGV Modal handlers - Added from generation component
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
    this.chargeError = null
    this.paymentError = null
  }

  // Modified balance charging methods to check CGV first
  showAddFundsModal(): void {
    // Check if CGV has been accepted for this session
    if (!this.cgvAccepted) {
      // Store the payment action to execute after CGV acceptance
      this.pendingPaymentAction = () => {
        this.proceedToShowAddFundsModal()
      }
      this.showCgvModal = true
      return
    }

    this.proceedToShowAddFundsModal()
  }

  private proceedToShowAddFundsModal(): void {
    this.chargeAmount = Math.max(50, 100) // Default minimum charge amount
    this.showBalanceChargeModal = true
    this.selectedChargeMethod = null
    this.chargeError = null
  }

  selectChargeMethod(method: "card" | "paypal" | "verment"): void {
    this.selectedChargeMethod = method
    this.chargeError = null
  }

  closeBalanceChargeModal(): void {
    this.showBalanceChargeModal = false
    this.selectedChargeMethod = null
    this.chargeError = null
    this.chargeAmount = 0
  }

  onChargeAmountChange(event: any): void {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value
  }

  onChargeAmountBlur(event: any): void {
    const value = Number.parseFloat(event.target.value) || 0
    this.chargeAmount = value

    // Validate minimum amount
    const minimumAmount = 50
    if (this.chargeAmount < minimumAmount) {
      this.chargeAmount = minimumAmount
      event.target.value = this.chargeAmount.toString()
    }
  }

  getMinimumChargeAmount(): number {
    return 50 // Minimum charge amount in MAD
  }

  proceedWithBalanceCharge(): void {
    if (!this.selectedChargeMethod) {
      this.chargeError = "Please select a charging method"
      return
    }

    const minimumAmount = this.getMinimumChargeAmount()
    if (this.chargeAmount < minimumAmount) {
      this.chargeError = `Minimum charge amount is ${minimumAmount} MAD`
      return
    }

    if (this.chargeAmount <= 0) {
      this.chargeError = "Please enter a valid charge amount"
      return
    }

    this.isChargingBalance = true
    this.chargeError = null

    switch (this.selectedChargeMethod) {
      case "paypal":
        this.chargeBalanceWithPayPal()
        break
      case "card":
        this.chargeBalanceWithCard()
        break
      case "verment":
        this.chargeBalanceWithBankTransfer()
        break
    }
  }

  // PayPal balance charging - Updated to match your service
  chargeBalanceWithPayPal(): void {
    if (!this.userId) {
      this.chargeError = "User ID not found"
      this.isChargingBalance = false
      return
    }

    console.log("Charging balance with PayPal, amount:", this.chargeAmount)

    this.showPaymentProcessing = true

    // Use your PayPal service with the exact method signature
    this.paypalService.chargeBalance(this.userId, this.chargeAmount).subscribe({
      next: (response) => {
        console.log("PayPal balance charge response:", response)

        if (response.redirectUrl) {
          // Close modals and redirect to PayPal
          this.closeBalanceChargeModal()
          this.showPaymentProcessing = false

          // Redirect to PayPal
          window.location.href = response.redirectUrl
        } else {
          this.chargeError = "Failed to get PayPal redirect URL"
          this.isChargingBalance = false
          this.showPaymentProcessing = false
        }
      },
      error: (error) => {
        console.error("Error charging balance with PayPal:", error)
        this.chargeError = error.error?.message || error.message || "Failed to charge balance with PayPal"
        this.isChargingBalance = false
        this.showPaymentProcessing = false
      },
    })
  }

  // Card balance charging
  chargeBalanceWithCard(): void {
    // Implement card payment logic here
    this.chargeError = "Credit card charging not implemented yet"
    this.isChargingBalance = false
  }

  // Bank transfer balance charging
  chargeBalanceWithBankTransfer(): void {
    // Implement bank transfer logic here
    this.chargeError = "Bank transfer charging not implemented yet"
    this.isChargingBalance = false
  }

  retryBalanceCharge(): void {
    this.chargeError = null
    this.isChargingBalance = false
    this.showPaymentProcessing = false
    this.showBalanceChargeModal = true
  }

  // Handle successful balance charge (called when user returns from PayPal)
  handleBalanceChargeSuccess(): void {
    this.isChargingBalance = false
    this.showPaymentProcessing = false
    this.closeBalanceChargeModal()

    // Refresh balance after successful charge
    this.loadUserBalance()

    // Show success message
    console.log("Balance charged successfully!")

    // You can add a toast notification here
    // this.showSuccessToast("Balance charged successfully!")
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard:", text)
        // You can show a toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
  }

  // Existing methods remain the same...
  private loadNotifications(): void {
    this.notifications = [
      {
        id: 1,
        icon: "bi-file-earmark-text",
        text: "header.notifications.items.voiceCompleted",
        time: "header.notifications.times.twoMinAgo",
        unread: true,
      },
      {
        id: 2,
        icon: "bi-person",
        text: "header.notifications.items.newComment",
        time: "header.notifications.times.oneHourAgo",
        unread: true,
      },
      {
        id: 3,
        icon: "bi-check-circle",
        text: "header.notifications.items.requestApproved",
        time: "header.notifications.times.twoHoursAgo",
        unread: true,
      },
    ]
  }

  private initializeTranslations(): void {
    this.translate.get("header.title").subscribe({
      next: (res) => console.log("Translation test:", res),
      error: (err) => console.error("Translation error:", err),
    })
  }

  changeLanguage(lang: Language): void {
    this.translationService.changeLanguage(lang)
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage()
  }

  getLanguageDisplayName(): string {
    const currentLang = this.getCurrentLanguage()
    switch (currentLang) {
      case "en":
        return "EN"
      case "fr":
        return "FR"
      case "es":
        return "ES"
      default:
        return "EN"
    }
  }

  getLanguageFlag(): string {
    const currentLang = this.getCurrentLanguage()
    switch (currentLang) {
      case "en":
        return "🇺🇸"
      case "fr":
        return "🇫🇷"
      case "es":
        return "🇪🇸"
      default:
        return "🇺🇸"
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.unread = false
    })
    this.notificationCount = 0
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification && notification.unread) {
      notification.unread = false
      this.notificationCount = Math.max(0, this.notificationCount - 1)
    }
  }

  logout(): void {
    console.log("Logging out...")
    localStorage.clear()
    this.router.navigate(["/login"])
  }

  loadUserPhoto(userId: string): void {
    this.utilisateurService.getPhoto(userId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob)
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
      },
      error: (error) => {
        console.error("Error loading user photo:", error)
        this.profilePhotoUrl = null
      },
    })
  }

  onSearchSubmit(searchTerm: string): void {
    if (searchTerm.trim()) {
      console.log("Searching for:", searchTerm)
    }
  }

  navigateToNotifications(): void {
    this.router.navigate(["/notifications"])
  }

  navigateToProfile(): void {
    this.router.navigate(["/profile"])
  }

  navigateToSettings(): void {
    this.router.navigate(["/settings"])
  }
}
