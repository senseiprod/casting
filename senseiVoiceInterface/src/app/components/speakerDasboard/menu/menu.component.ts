import { Component,  OnInit,  OnDestroy } from "@angular/core"
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
import  { NotificationService, NotificationResponse } from "../../../services/notification.service"
import {  Subscription, interval } from "rxjs"

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit, OnDestroy {
  voices: VoixResponse[] = []
  userId: string | null = ""
  audio = ""
  speaker: ClientResponse = new ClientResponse()
  errorMessage: string | null = null
  photoUrl: string | ArrayBuffer | null = null
  id = 0
  profilePhotoUrl: SafeUrl | null = null

  // Notification properties - Updated to use real data
  notificationCount = 0
  notifications: NotificationResponse[] = []
  isLoadingNotifications = false
  notificationError: string | null = null
  private notificationSubscription?: Subscription
  private notificationRefreshInterval?: Subscription

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

  // Removed CGV Modal properties
  // showCgvModal = false
  // cgvAccepted = false
  // pendingPaymentAction: (() => void) | null = null

  isLoadingPhoto = false
  isUpdatingProfile = false
  isUploadingPhoto = false
  userPhotoUrl: SafeUrl | null = null

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
    private notificationService: NotificationService, // Added NotificationService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get("uuid")
    this.loadUserData()
    this.loadUserPhoto()
    this.loadNotifications()
    this.initializeTranslations()
    this.loadUserBalance()
    this.startNotificationRefresh()
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe()
    }
    if (this.notificationRefreshInterval) {
      this.notificationRefreshInterval.unsubscribe()
    }
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

  // Updated notification methods to use NotificationService
  private loadNotifications(): void {
    if (!this.userId) {
      console.warn("User ID not available for loading notifications")
      return
    }

    this.isLoadingNotifications = true
    this.notificationError = null

    // Load recent notifications (last 24 hours)
    this.notificationSubscription = this.notificationService.getRecentNotifications(this.userId, 24).subscribe({
      next: (notifications) => {
        this.notifications = notifications
        this.updateNotificationCount()
        this.isLoadingNotifications = false
        console.log("Notifications loaded:", notifications.length)
      },
      error: (error) => {
        console.error("Error loading notifications:", error)
        this.notificationError = "Failed to load notifications"
        this.isLoadingNotifications = false
        // Fallback to empty array
        this.notifications = []
        this.notificationCount = 0
      },
    })
  }

  private updateNotificationCount(): void {
    if (!this.userId) return

    this.notificationService.getUnreadCount(this.userId).subscribe({
      next: (response) => {
        this.notificationCount = response.unreadCount
      },
      error: (error) => {
        console.error("Error getting unread count:", error)
        // Fallback: count unread notifications manually
        this.notificationCount = this.notifications.filter((n) => !n.readAt).length
      },
    })
  }

  private startNotificationRefresh(): void {
    // Refresh notifications every 30 seconds
    this.notificationRefreshInterval = interval(30000).subscribe(() => {
      this.refreshNotifications()
    })
  }

  refreshNotifications(): void {
    this.loadNotifications()
  }

  markAllNotificationsAsRead(): void {
    if (!this.userId) return

    this.notificationService.markAllAsRead(this.userId).subscribe({
      next: (response) => {
        console.log("All notifications marked as read:", response)
        // Update local state
        this.notifications.forEach((notification) => {
          if (!notification.readAt) {
            notification.readAt = new Date().toISOString()
          }
        })
        this.notificationCount = 0
      },
      error: (error) => {
        console.error("Error marking all notifications as read:", error)
        // Show error message to user
        this.notificationError = "Failed to mark notifications as read"
      },
    })
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (!notification || notification.readAt) {
      return // Already read or not found
    }

    this.notificationService.markAsRead(notificationId).subscribe({
      next: (response) => {
        console.log("Notification marked as read:", response)
        // Update local state
        notification.readAt = new Date().toISOString()
        this.notificationCount = Math.max(0, this.notificationCount - 1)
      },
      error: (error) => {
        console.error("Error marking notification as read:", error)
        this.notificationError = "Failed to mark notification as read"
      },
    })
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: (response) => {
        console.log("Notification deleted:", response)
        // Remove from local array
        const index = this.notifications.findIndex((n) => n.id === notificationId)
        if (index > -1) {
          const wasUnread = !this.notifications[index].readAt
          this.notifications.splice(index, 1)
          if (wasUnread) {
            this.notificationCount = Math.max(0, this.notificationCount - 1)
          }
        }
      },
      error: (error) => {
        console.error("Error deleting notification:", error)
        this.notificationError = "Failed to delete notification"
      },
    })
  }

  // Method to get filtered notifications
  loadFilteredNotifications(type?: string, status?: string): void {
    if (!this.userId) return

    this.isLoadingNotifications = true
    this.notificationError = null

    this.notificationService.getFilteredNotifications(this.userId, type, status, 0, 20).subscribe({
      next: (response) => {
        this.notifications = response.content || response // Handle different response formats
        this.updateNotificationCount()
        this.isLoadingNotifications = false
      },
      error: (error) => {
        console.error("Error loading filtered notifications:", error)
        this.notificationError = "Failed to load filtered notifications"
        this.isLoadingNotifications = false
      },
    })
  }

  // Method to handle notification click actions
  handleNotificationAction(notification: NotificationResponse): void {
    // Mark as read if not already read
    if (!notification.readAt) {
      this.markNotificationAsRead(notification.id)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl])
    }
  }

  // Method to get notification icon based on type
  getNotificationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case "voice_completed":
      case "task_completed":
        return "bi-check-circle"
      case "new_message":
      case "comment":
        return "bi-chat-dots"
      case "payment":
      case "balance":
        return "bi-wallet2"
      case "system":
        return "bi-gear"
      case "warning":
        return "bi-exclamation-triangle"
      case "info":
        return "bi-info-circle"
      default:
        return "bi-bell"
    }
  }

  // Method to format notification time
  formatNotificationTime(createdAt: string): string {
    const now = new Date()
    const notificationTime = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
  }

  // TrackBy function for Angular *ngFor to improve performance
  trackNotificationById(index: number, notification: NotificationResponse): number {
    return notification.id || index
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

  // Removed CGV Modal handlers
  // onCgvAccepted() { ... }
  // onCgvClosed() { ... }

  showAddFundsModal(): void {
    // Direct call to show modal without CGV check
    this.proceedToShowAddFundsModal()
  }

  private proceedToShowAddFundsModal(): void {
    this.chargeAmount = Math.max(50, 100)
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

    const minimumAmount = 50
    if (this.chargeAmount < minimumAmount) {
      this.chargeAmount = minimumAmount
      event.target.value = this.chargeAmount.toString()
    }
  }

  getMinimumChargeAmount(): number {
    return 50
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

    // Direct execution without CGV check
    this.executeBalanceCharge()
  }

  private executeBalanceCharge(): void {
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

  chargeBalanceWithPayPal(): void {
    if (!this.userId) {
      this.chargeError = "User ID not found"
      this.isChargingBalance = false
      return
    }

    console.log("Charging balance with PayPal, amount:", this.chargeAmount)

    this.showPaymentProcessing = true

    this.paypalService.chargeBalance(this.userId, this.chargeAmount).subscribe({
      next: (response) => {
        console.log("PayPal balance charge response:", response)

        if (response.redirectUrl) {
          this.closeBalanceChargeModal()
          this.showPaymentProcessing = false

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

  chargeBalanceWithCard(): void {
    this.chargeError = "Credit card charging not implemented yet"
    this.isChargingBalance = false
  }

  chargeBalanceWithBankTransfer(): void {
    this.chargeError = "Bank transfer charging not implemented yet"
    this.isChargingBalance = false
  }

  retryBalanceCharge(): void {
    this.chargeError = null
    this.isChargingBalance = false
    this.showPaymentProcessing = false
    this.showBalanceChargeModal = true
  }

  handleBalanceChargeSuccess(): void {
    this.isChargingBalance = false
    this.showPaymentProcessing = false
    this.closeBalanceChargeModal()

    this.loadUserBalance()

    console.log("Balance charged successfully!")
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard:", text)
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
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
      case 'ar':
        return 'ع';
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

  logout(): void {
    console.log("Logging out...")
    localStorage.clear()
    this.router.navigate(["/login"])
  }

  onSearchSubmit(searchTerm: string): void {
    if (searchTerm.trim()) {
      console.log("Searching for:", searchTerm)
    }
  }

  // ========== THIS IS THE MODIFIED METHOD ==========
  navigateToNotifications(): void {
    if (this.userId) {
      // Navigate to the user-specific notifications page
      this.router.navigate([`speakerDasboard/${this.userId}/notification`]);
    } else {
      // Fallback in case the userId is not available
      console.error("Cannot navigate to notifications page, User ID is missing.");
    }
  }
  // ===============================================

  navigateToProfile(): void {
    this.router.navigate(["/profile"])
  }

  navigateToSettings(): void {
    if (this.userId) {
      // Navigate to the user-specific notifications page
      this.router.navigate([`speakerDasboard/${this.userId}/profile`]);
    } else {
      // Fallback in case the userId is not available
      console.error("Cannot navigate to notifications page, User ID is missing.");
    }
  }

  loadUserPhoto(): void {
    if (this.userId) {
      this.isLoadingPhoto = true
      this.utilisateurService.getPhoto(this.userId).subscribe({
        next: (photoBlob: Blob) => {
          // Create object URL and sanitize it
          const objectURL = URL.createObjectURL(photoBlob)
          this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
          this.isLoadingPhoto = false
          console.log("User photo loaded successfully")
        },
        error: (error) => {
          console.error("Error loading photo:", error)
          this.userPhotoUrl = null // This will trigger the fallback image
          this.isLoadingPhoto = false
        },
      })
    }
  }

  onImageError(event: any): void {
    console.log("Image failed to load, using fallback")
    event.target.src = "assets/img/png-clipart-computer-icons-avatar-avatar-web-design-heroes.png"
  }

  onImageLoad(event: any): void {
    console.log("Image loaded successfully")
    // Optional: Add any additional logic when image loads
  }
}