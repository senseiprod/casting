import { Component,  OnInit, ViewChild,  ElementRef,  AfterViewInit,  OnDestroy } from "@angular/core"
import  {
  UtilisateurService,
  UtilisateurRequest,
  ChangePasswordRequest,
} from "../../../services/utilisateur-service.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ActivatedRoute } from "@angular/router"
import  { ClientService } from "src/app/services/client-service.service"
import  { AuthService } from "src/app/services/auth.service"

interface NotificationSetting {
  id: string
  type: string
  description: string
  email: boolean
  sms: boolean
  push: boolean
}

interface SecurityLog {
  id: string
  activity: string
  device: string
  location: string
  ip: string
  date: string
  time: string
  icon: string
}

interface ConnectedApp {
  id: string
  name: string
  icon: string
  description: string
  connectedDate: string
  permissions: string[]
}

interface BillingPlan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  isPopular?: boolean
  isCurrent?: boolean
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

@Component({
  selector: "app-profil",
  templateUrl: "./profil.component.html",
  styleUrls: ["./profil.component.css"],
})
export class ProfilComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("cropCanvas", { static: false }) cropCanvas!: ElementRef<HTMLCanvasElement>
  @ViewChild("previewCanvas", { static: false }) previewCanvas!: ElementRef<HTMLCanvasElement>

  // Password change form with validation
  passwordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  }

  // Password validation states
  passwordValidation = {
    currentPasswordError: "",
    newPasswordError: "",
    confirmPasswordError: "",
    generalError: "",
    successMessage: "",
  }

  // Active tab
  activeTab = "general"
  // Show delete account form
  showDeleteAccountForm = false

  // Photo cropping properties
  showPhotoCropModal = false
  originalImage: HTMLImageElement | null = null
  cropArea: CropArea | null = null
  isDragging = false
  isResizing = false
  resizeHandle = ""
  dragStart = { x: 0, y: 0 }
  cropAspectRatio = 1 // 1:1 for square, 0 for free
  cropZoom = 1
  croppedPhotoBlob: Blob | null = null

  // User data
  currentUser: UtilisateurRequest | null = null
  userPhotoUrl: SafeUrl | null = null
  selectedPhotoFile: File | null = null

  // Loading states
  isLoadingPhoto = false
  isUpdatingProfile = false
  isUploadingPhoto = false

  // General settings
  generalSettings = {
    language: "english",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    autoSave: true,
    darkMode: false,
  }

  // Account settings
  accountSettings = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Voice Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
  }

  // Notification settings
  notificationSettings: NotificationSetting[] = [
    {
      id: "notification-1",
      type: "Projects",
      description: "New project requests",
      email: true,
      sms: false,
      push: true,
    },
    {
      id: "notification-2",
      type: "Projects",
      description: "Project status updates",
      email: true,
      sms: false,
      push: true,
    },
    {
      id: "notification-3",
      type: "Payments",
      description: "Payment received",
      email: true,
      sms: true,
      push: true,
    },
    {
      id: "notification-4",
      type: "Payments",
      description: "Invoice due reminders",
      email: true,
      sms: true,
      push: false,
    },
  ]

  // Privacy settings
  privacySettings = {
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowReviews: true,
    allowTestimonials: true,
    dataSharing: false,
  }

  // Security settings
  securitySettings = {
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: "30m",
    passwordExpiry: "90d",
  }

  // Security logs
  securityLogs: SecurityLog[] = [
    {
      id: "log-1",
      activity: "Login",
      device: "MacBook Pro - Chrome",
      location: "New York, USA",
      ip: "192.168.1.1",
      date: "Today",
      time: "10:45 AM",
      icon: "bi-box-arrow-in-right",
    },
    {
      id: "log-2",
      activity: "Password Changed",
      device: "MacBook Pro - Chrome",
      location: "New York, USA",
      ip: "192.168.1.1",
      date: "Yesterday",
      time: "03:22 PM",
      icon: "bi-key",
    },
    {
      id: "log-3",
      activity: "Login",
      device: "iPhone 13 - Safari",
      location: "New York, USA",
      ip: "192.168.1.2",
      date: "2 days ago",
      time: "09:15 AM",
      icon: "bi-box-arrow-in-right",
    },
    {
      id: "log-4",
      activity: "Profile Updated",
      device: "MacBook Pro - Chrome",
      location: "New York, USA",
      ip: "192.168.1.1",
      date: "1 week ago",
      time: "02:45 PM",
      icon: "bi-person",
    },
    {
      id: "log-5",
      activity: "Login",
      device: "Windows PC - Firefox",
      location: "Boston, USA",
      ip: "192.168.1.3",
      date: "2 weeks ago",
      time: "11:30 AM",
      icon: "bi-box-arrow-in-right",
    },
  ]

  // Connected apps
  connectedApps: ConnectedApp[] = [
    {
      id: "app-1",
      name: "Google Drive",
      icon: "bi-google",
      description: "Cloud storage for voice samples and files",
      connectedDate: "Connected on Apr 15, 2023",
      permissions: ["Read files", "Write files"],
    },
    {
      id: "app-2",
      name: "Dropbox",
      icon: "bi-dropbox",
      description: "Cloud storage for project deliverables",
      connectedDate: "Connected on Mar 22, 2023",
      permissions: ["Read files", "Write files"],
    },
    {
      id: "app-3",
      name: "Slack",
      icon: "bi-slack",
      description: "Team communication and notifications",
      connectedDate: "Connected on Feb 10, 2023",
      permissions: ["Send messages", "Read channels"],
    },
  ]

  // Billing plans
  billingPlans: BillingPlan[] = [
    {
      id: "plan-1",
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["5 voice samples", "Basic analytics", "Standard support", "Limited storage (100MB)"],
    },
    {
      id: "plan-2",
      name: "Professional",
      price: "$19.99",
      period: "per month",
      features: [
        "Unlimited voice samples",
        "Advanced analytics",
        "Priority support",
        "Enhanced storage (10GB)",
        "Custom profile page",
        "No platform fees",
      ],
      isPopular: true,
      isCurrent: true,
    },
    {
      id: "plan-3",
      name: "Business",
      price: "$49.99",
      period: "per month",
      features: [
        "Everything in Professional",
        "Team management",
        "API access",
        "White-label options",
        "Dedicated account manager",
        "Premium storage (100GB)",
      ],
    },
  ]

  // Billing history
  billingHistory = [
    {
      id: "invoice-1",
      date: "Apr 15, 2023",
      description: "Professional Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "invoice-2",
      date: "Mar 15, 2023",
      description: "Professional Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "invoice-3",
      date: "Feb 15, 2023",
      description: "Professional Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "invoice-4",
      date: "Jan 15, 2023",
      description: "Professional Plan - Monthly",
      amount: "$19.99",
      status: "Paid",
      paymentMethod: "Visa ending in 4242",
    },
  ]
  userId: string
  isChangingPassword = false

  constructor(
    private utilisateurService: UtilisateurService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
      if (this.userId) {
        this.loadUserProfile()
        this.loadUserPhoto()
      }
    })
    this.clientService.getClientByUuid(this.userId).subscribe({
      next: (client) => {
        if (client) {
          this.accountSettings.firstName = client.prenom
          this.accountSettings.lastName = client.nom
          this.accountSettings.email = client.email
          this.accountSettings.phone = client.phone
          this.mapAccountSettingsToUser()
        }
      },
      error: (error) => {
        console.error("Error loading client data:", error)
      },
    })
  }

  // Load user profile data
  loadUserProfile(): void {
    const userId = this.userId
    if (userId) {
      this.mapAccountSettingsToUser()
    }
  }

  // Load user photo
  loadUserPhoto(): void {
    if (this.userId) {
      this.isLoadingPhoto = true
      this.utilisateurService.getPhoto(this.userId).subscribe({
        next: (photoBlob: Blob) => {
          const objectURL = URL.createObjectURL(photoBlob)
          this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
          this.isLoadingPhoto = false
        },
        error: (error) => {
          console.error("Error loading photo:", error)
          this.isLoadingPhoto = false
        },
      })
    }
  }

  // Handle photo file selection
  onPhotoSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        alert("Please select a valid image file (JPG, PNG, or GIF)")
        return
      }

      this.selectedPhotoFile = file
      this.loadImageForCropping(file)
    }
  }

  // Load image for cropping
  loadImageForCropping(file: File): void {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const img = new Image()
      img.onload = () => {
        this.originalImage = img
        this.showPhotoCropModal = true
        setTimeout(() => {
          this.initializeCropCanvas()
        }, 100)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Initialize crop canvas
  initializeCropCanvas(): void {
    if (!this.cropCanvas || !this.originalImage) return

    const canvas = this.cropCanvas.nativeElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const maxWidth = 600
    const maxHeight = 400
    let { width, height } = this.originalImage

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width *= ratio
      height *= ratio
    }

    canvas.width = width
    canvas.height = height

    // Draw image with current zoom
    this.redrawCanvasWithZoom()

    // Initialize crop area if it doesn't exist
    if (!this.cropArea) {
      const size = Math.min(width, height) * 0.6
      this.cropArea = {
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size,
      }
    }

    this.updatePreview()
  }

  // Start crop selection
  startCrop(event: MouseEvent): void {
    if (this.isResizing) return

    const canvas = this.cropCanvas.nativeElement
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)

    // Check if clicking inside existing crop area
    if (this.cropArea && this.isPointInCropArea(x, y)) {
      this.isDragging = true
      this.dragStart = {
        x: x - this.cropArea.x,
        y: y - this.cropArea.y,
      }
    } else {
      // Start new crop area
      this.cropArea = {
        x: x,
        y: y,
        width: 0,
        height: 0,
      }
      this.isDragging = true
      this.dragStart = { x: 0, y: 0 }
    }
  }

  // Update crop selection
  updateCrop(event: MouseEvent): void {
    if (!this.isDragging && !this.isResizing) return

    const canvas = this.cropCanvas.nativeElement
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)

    if (this.isResizing && this.cropArea) {
      this.handleResize(x, y)
    } else if (this.isDragging && this.cropArea) {
      if (this.cropArea.width === 0 && this.cropArea.height === 0) {
        // Creating new crop area
        const startX = Math.min(this.cropArea.x, x)
        const startY = Math.min(this.cropArea.y, y)
        const width = Math.abs(x - this.cropArea.x)
        const height = Math.abs(y - this.cropArea.y)

        // Apply aspect ratio if set
        if (this.cropAspectRatio > 0) {
          const aspectWidth = height * this.cropAspectRatio
          const aspectHeight = width / this.cropAspectRatio

          if (aspectWidth <= canvas.width - startX) {
            this.cropArea = { x: startX, y: startY, width: aspectWidth, height }
          } else {
            this.cropArea = { x: startX, y: startY, width, height: aspectHeight }
          }
        } else {
          this.cropArea = { x: startX, y: startY, width, height }
        }
      } else {
        // Move existing crop area
        const newX = x - this.dragStart.x
        const newY = y - this.dragStart.y

        this.cropArea.x = Math.max(0, Math.min(newX, canvas.width - this.cropArea.width))
        this.cropArea.y = Math.max(0, Math.min(newY, canvas.height - this.cropArea.height))
      }
    }

    this.updatePreview()
  }

  // Add helper method to check if point is in crop area
  private isPointInCropArea(x: number, y: number): boolean {
    if (!this.cropArea) return false

    return (
      x >= this.cropArea.x &&
      x <= this.cropArea.x + this.cropArea.width &&
      y >= this.cropArea.y &&
      y <= this.cropArea.y + this.cropArea.height
    )
  }

  // Handle resize operations
  private handleResize(x: number, y: number): void {
    if (!this.cropArea) return

    const canvas = this.cropCanvas.nativeElement
    const minSize = 50

    switch (this.resizeHandle) {
      case "nw":
        const newWidth = this.cropArea.x + this.cropArea.width - x
        const newHeight = this.cropArea.y + this.cropArea.height - y
        if (newWidth >= minSize && newHeight >= minSize) {
          this.cropArea.width = newWidth
          this.cropArea.height = newHeight
          this.cropArea.x = x
          this.cropArea.y = y
        }
        break
      case "ne":
        const neWidth = x - this.cropArea.x
        const neHeight = this.cropArea.y + this.cropArea.height - y
        if (neWidth >= minSize && neHeight >= minSize) {
          this.cropArea.width = neWidth
          this.cropArea.height = neHeight
          this.cropArea.y = y
        }
        break
      case "sw":
        const swWidth = this.cropArea.x + this.cropArea.width - x
        const swHeight = y - this.cropArea.y
        if (swWidth >= minSize && swHeight >= minSize) {
          this.cropArea.width = swWidth
          this.cropArea.height = swHeight
          this.cropArea.x = x
        }
        break
      case "se":
        const seWidth = x - this.cropArea.x
        const seHeight = y - this.cropArea.y
        if (seWidth >= minSize && seHeight >= minSize) {
          this.cropArea.width = seWidth
          this.cropArea.height = seHeight
        }
        break
      case "n":
        const nHeight = this.cropArea.y + this.cropArea.height - y
        if (nHeight >= minSize) {
          this.cropArea.height = nHeight
          this.cropArea.y = y
        }
        break
      case "s":
        const sHeight = y - this.cropArea.y
        if (sHeight >= minSize) {
          this.cropArea.height = sHeight
        }
        break
      case "w":
        const wWidth = this.cropArea.x + this.cropArea.width - x
        if (wWidth >= minSize) {
          this.cropArea.width = wWidth
          this.cropArea.x = x
        }
        break
      case "e":
        const eWidth = x - this.cropArea.x
        if (eWidth >= minSize) {
          this.cropArea.width = eWidth
        }
        break
    }

    // Apply aspect ratio constraint if set
    if (this.cropAspectRatio > 0) {
      this.constrainToAspectRatio()
    }

    // Keep crop area within canvas bounds
    this.constrainToBounds(canvas)
  }

  // Constrain crop area to aspect ratio
  private constrainToAspectRatio(): void {
    if (!this.cropArea || this.cropAspectRatio <= 0) return

    const currentRatio = this.cropArea.width / this.cropArea.height

    if (Math.abs(currentRatio - this.cropAspectRatio) > 0.01) {
      if (currentRatio > this.cropAspectRatio) {
        // Too wide, adjust width
        this.cropArea.width = this.cropArea.height * this.cropAspectRatio
      } else {
        // Too tall, adjust height
        this.cropArea.height = this.cropArea.width / this.cropAspectRatio
      }
    }
  }

  // Keep crop area within canvas bounds
  private constrainToBounds(canvas: HTMLCanvasElement): void {
    if (!this.cropArea) return

    // Ensure crop area doesn't go outside canvas
    if (this.cropArea.x < 0) {
      this.cropArea.width += this.cropArea.x
      this.cropArea.x = 0
    }
    if (this.cropArea.y < 0) {
      this.cropArea.height += this.cropArea.y
      this.cropArea.y = 0
    }
    if (this.cropArea.x + this.cropArea.width > canvas.width) {
      this.cropArea.width = canvas.width - this.cropArea.x
    }
    if (this.cropArea.y + this.cropArea.height > canvas.height) {
      this.cropArea.height = canvas.height - this.cropArea.y
    }
  }

  // End crop selection
  endCrop(event: MouseEvent): void {
    this.isDragging = false
    this.isResizing = false
  }

  // Start resize
  startResize(event: MouseEvent, handle: string): void {
    event.stopPropagation()
    event.preventDefault()
    this.isResizing = true
    this.resizeHandle = handle
    this.dragStart = { x: event.clientX, y: event.clientY }
  }

  // Set crop aspect ratio
  setCropAspectRatio(ratio: number): void {
    this.cropAspectRatio = ratio
    if (this.cropArea && ratio > 0) {
      // Adjust crop area to match aspect ratio
      const currentRatio = this.cropArea.width / this.cropArea.height
      if (currentRatio !== ratio) {
        if (currentRatio > ratio) {
          // Make narrower
          this.cropArea.width = this.cropArea.height * ratio
        } else {
          // Make shorter
          this.cropArea.height = this.cropArea.width / ratio
        }
        this.updatePreview()
      }
    }
  }

  // Update image zoom
  updateImageZoom(): void {
    if (!this.originalImage) return

    setTimeout(() => {
      this.redrawCanvasWithZoom()
    }, 10)
  }

  // Redraw canvas with zoom applied
  private redrawCanvasWithZoom(): void {
    if (!this.cropCanvas || !this.originalImage) return

    const canvas = this.cropCanvas.nativeElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate zoomed dimensions
    let width = this.originalImage.width * this.cropZoom
    let height = this.originalImage.height * this.cropZoom

    // Scale to fit canvas while maintaining aspect ratio
    const maxWidth = canvas.width
    const maxHeight = canvas.height
    const scaleToFit = Math.min(maxWidth / width, maxHeight / height)
    width *= scaleToFit
    height *= scaleToFit

    // Center the image
    const offsetX = (canvas.width - width) / 2
    const offsetY = (canvas.height - height) / 2

    // Draw image
    ctx.drawImage(this.originalImage, offsetX, offsetY, width, height)

    // Update preview if crop area exists
    if (this.cropArea) {
      this.updatePreview()
    }
  }

  // Update preview
  updatePreview(): void {
    if (!this.previewCanvas || !this.originalImage || !this.cropArea) return

    const canvas = this.previewCanvas.nativeElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 150
    canvas.width = size
    canvas.height = size

    // Get the display canvas dimensions
    const displayCanvas = this.cropCanvas.nativeElement

    // Calculate the actual image dimensions as drawn on canvas
    let displayWidth = this.originalImage.width * this.cropZoom
    let displayHeight = this.originalImage.height * this.cropZoom

    // Scale to fit canvas while maintaining aspect ratio
    const scaleToFit = Math.min(displayCanvas.width / displayWidth, displayCanvas.height / displayHeight)
    displayWidth *= scaleToFit
    displayHeight *= scaleToFit

    // Calculate offset for centering
    const offsetX = (displayCanvas.width - displayWidth) / 2
    const offsetY = (displayCanvas.height - displayHeight) / 2

    // Calculate source coordinates on original image
    const scaleX = this.originalImage.width / displayWidth
    const scaleY = this.originalImage.height / displayHeight

    const sourceX = Math.max(0, (this.cropArea.x - offsetX) * scaleX)
    const sourceY = Math.max(0, (this.cropArea.y - offsetY) * scaleY)
    const sourceWidth = Math.min(this.cropArea.width * scaleX, this.originalImage.width - sourceX)
    const sourceHeight = Math.min(this.cropArea.height * scaleY, this.originalImage.height - sourceY)

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Draw cropped image
    if (sourceWidth > 0 && sourceHeight > 0) {
      ctx.drawImage(this.originalImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size)
    }
  }

  // Apply crop
  applyCrop(): void {
    if (!this.originalImage || !this.cropArea) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set output size
    const outputSize = 400
    canvas.width = outputSize
    canvas.height = outputSize

    // Get the display canvas dimensions
    const displayCanvas = this.cropCanvas.nativeElement

    // Calculate the actual image dimensions as drawn on canvas
    const maxWidth = 600
    const maxHeight = 400
    let displayWidth = this.originalImage.width * this.cropZoom
    let displayHeight = this.originalImage.height * this.cropZoom

    // Scale to fit canvas while maintaining aspect ratio
    const scaleToFit = Math.min(maxWidth / displayWidth, maxHeight / displayHeight)
    displayWidth *= scaleToFit
    displayHeight *= scaleToFit

    // Calculate offset for centering
    const offsetX = (displayCanvas.width - displayWidth) / 2
    const offsetY = (displayCanvas.height - displayHeight) / 2

    // Calculate source coordinates on original image
    const scaleX = this.originalImage.width / displayWidth
    const scaleY = this.originalImage.height / displayHeight

    const sourceX = Math.max(0, (this.cropArea.x - offsetX) * scaleX)
    const sourceY = Math.max(0, (this.cropArea.y - offsetY) * scaleY)
    const sourceWidth = Math.min(this.cropArea.width * scaleX, this.originalImage.width - sourceX)
    const sourceHeight = Math.min(this.cropArea.height * scaleY, this.originalImage.height - sourceY)

    // Draw cropped image
    ctx.drawImage(this.originalImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputSize, outputSize)

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          this.croppedPhotoBlob = blob
          const objectURL = URL.createObjectURL(blob)
          this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
          this.closeCropModal()
        }
      },
      "image/jpeg",
      0.9,
    )
  }

  // Close crop modal
  closeCropModal(): void {
    this.showPhotoCropModal = false
    this.originalImage = null
    this.cropArea = null
    this.isDragging = false
    this.isResizing = false
  }

  // Upload photo
  uploadPhoto(): void {
    if (this.croppedPhotoBlob) {
      const userId = this.getCurrentUserId()
      if (this.userId) {
        this.isUploadingPhoto = true

        // Convert blob to file
        const file = new File([this.croppedPhotoBlob], "profile-photo.jpg", { type: "image/jpeg" })

        this.utilisateurService.uploadPhoto(this.userId, file).subscribe({
          next: (response) => {
            console.log("Photo uploaded successfully:", response)
            this.isUploadingPhoto = false
            this.selectedPhotoFile = null
            this.croppedPhotoBlob = null
            this.loadUserPhoto()
          },
          error: (error) => {
            console.error("Error uploading photo:", error)
            this.isUploadingPhoto = false
          },
        })
      }
    }
  }

  // Remove photo
  removePhoto(): void {
    if (confirm("Are you sure you want to remove your profile photo?")) {
      // Implement photo removal logic here
      this.userPhotoUrl = null
      this.selectedPhotoFile = null
      this.croppedPhotoBlob = null
      console.log("Photo removed")
    }
  }

  // Update user profile
  updateUserProfile(): void {
    if (this.currentUser) {
      this.isUpdatingProfile = true
      this.utilisateurService.updateUtilisateur(this.userId, this.currentUser).subscribe({
        next: (response) => {
          console.log("Profile updated successfully:", response)
          this.isUpdatingProfile = false
          this.mapUserToAccountSettings()
        },
        error: (error) => {
          console.error("Error updating profile:", error)
          this.isUpdatingProfile = false
        },
      })
    }
  }

  // Map account settings to user object
  private mapAccountSettingsToUser(): void {
    this.currentUser = {
      id: 0,
      code: "",
      nom: this.accountSettings.lastName,
      prenom: this.accountSettings.firstName,
      email: this.accountSettings.email,
      motDePasse: "",
      role: "CLIENT",
      phone: this.accountSettings.phone,
      deleted: false,
      verified: true,
      balance: 0,
      fidelity: 0,
    }
  }

  // Map user object back to account settings
  private mapUserToAccountSettings(): void {
    if (this.currentUser) {
      this.accountSettings.firstName = this.currentUser.prenom
      this.accountSettings.lastName = this.currentUser.nom
      this.accountSettings.email = this.currentUser.email
      this.accountSettings.phone = this.currentUser.phone
    }
  }

  // Get current user ID
  private getCurrentUserId(): string | null {
    return "1" // Placeholder - replace with actual implementation
  }

  // Set active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  // Update general settings
  updateGeneralSettings(): void {
    console.log("Updating general settings:", this.generalSettings)
    // Implement update logic
  }

  // Update account settings
  updateAccountSettings(): void {
    this.mapAccountSettingsToUser()
    this.updateUserProfile()
  }

  // Update notification settings
  updateNotificationSettings(): void {
    console.log("Updating notification settings:", this.notificationSettings)
    // Implement update logic
  }

  // Update privacy settings
  updatePrivacySettings(): void {
    console.log("Updating privacy settings:", this.privacySettings)
    // Implement update logic
  }

  // Update security settings
  updateSecuritySettings(): void {
    console.log("Updating security settings:", this.securitySettings)
    // Implement update logic
  }

  // Disconnect app
  disconnectApp(appId: string): void {
    console.log("Disconnecting app:", appId)
    // Implement disconnect logic
  }

  // Change plan
  changePlan(planId: string): void {
    console.log("Changing to plan:", planId)
    // Implement plan change logic
  }

  // Download invoice
  downloadInvoice(invoiceId: string): void {
    console.log("Downloading invoice:", invoiceId)
    // Implement download logic
  }

  // Toggle two-factor authentication
  toggleTwoFactorAuth(): void {
    this.securitySettings.twoFactorAuth = !this.securitySettings.twoFactorAuth
    console.log("Two-factor authentication:", this.securitySettings.twoFactorAuth ? "Enabled" : "Disabled")
    // Implement toggle logic
  }

  // Delete account - show form instead of confirmation
  deleteAccount(): void {
    this.showDeleteAccountForm = true
  }

  // Cancel account deletion
  cancelDeleteAccount(): void {
    this.showDeleteAccountForm = false
  }

  // Process account deletion request
  processDeleteAccountRequest(formData: any): void {
    console.log("Processing account deletion request:", formData)
    setTimeout(() => {
      alert("Your account deletion request has been submitted. You will receive a confirmation email shortly.")
      this.showDeleteAccountForm = false
    }, 1500)
  }

  // Validate password form
  validatePasswordForm(): boolean {
    this.clearPasswordValidation()
    let isValid = true

    // Validate current password
    if (!this.passwordForm.currentPassword.trim()) {
      this.passwordValidation.currentPasswordError = "Current password is required"
      isValid = false
    }

    // Validate new password
    if (!this.passwordForm.newPassword.trim()) {
      this.passwordValidation.newPasswordError = "New password is required"
      isValid = false
    } else if (this.passwordForm.newPassword.length < 8) {
      this.passwordValidation.newPasswordError = "New password must be at least 8 characters long"
      isValid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.passwordForm.newPassword)) {
      this.passwordValidation.newPasswordError =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      isValid = false
    }

    // Validate confirm password
    if (!this.passwordForm.confirmPassword.trim()) {
      this.passwordValidation.confirmPasswordError = "Please confirm your new password"
      isValid = false
    } else if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordValidation.confirmPasswordError = "Passwords do not match"
      isValid = false
    }

    // Check if new password is different from current password
    if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
      this.passwordValidation.newPasswordError = "New password must be different from current password"
      isValid = false
    }

    return isValid
  }

  // Clear password validation messages
  clearPasswordValidation(): void {
    this.passwordValidation = {
      currentPasswordError: "",
      newPasswordError: "",
      confirmPasswordError: "",
      generalError: "",
      successMessage: "",
    }
  }

  // Change password
  changePassword(): void {
    if (!this.validatePasswordForm()) {
      return
    }

    this.isChangingPassword = true
    this.clearPasswordValidation()

    const changePasswordRequest: ChangePasswordRequest = {
      email: this.accountSettings.email,
      oldPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    }

    this.authService.changePassword(changePasswordRequest).subscribe({
      next: (response) => {
        console.log("Password changed successfully:", response)
        this.isChangingPassword = false
        this.passwordValidation.successMessage = "Password changed successfully!"

        // Clear the form
        this.passwordForm = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }

        // Add security log entry
        this.addSecurityLogEntry("Password Changed")

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          this.passwordValidation.successMessage = ""
        }, 5000)
      },
      error: (error) => {
        console.error("Error changing password:", error)
        this.isChangingPassword = false

        // Handle specific error messages
        if (error.status === 400) {
          this.passwordValidation.currentPasswordError = "Current password is incorrect"
        } else if (error.status === 404) {
          this.passwordValidation.generalError = "User not found"
        } else if (error.status === 422) {
          this.passwordValidation.generalError = "Invalid password format"
        } else {
          this.passwordValidation.generalError = "An error occurred while changing password. Please try again."
        }
      },
    })
  }

  // Add security log entry
  private addSecurityLogEntry(activity: string): void {
    const newLog: SecurityLog = {
      id: `log-${Date.now()}`,
      activity: activity,
      device: this.getCurrentDevice(),
      location: "Current Location", // You can implement geolocation if needed
      ip: "Current IP", // You can get this from your backend
      date: "Just now",
      time: new Date().toLocaleTimeString(),
      icon: "bi-key",
    }

    this.securityLogs.unshift(newLog)

    // Keep only the last 10 entries
    if (this.securityLogs.length > 10) {
      this.securityLogs = this.securityLogs.slice(0, 10)
    }
  }

  // Get current device info
  private getCurrentDevice(): string {
    const userAgent = navigator.userAgent
    let device = "Unknown Device"

    if (userAgent.includes("Chrome")) {
      device = "Chrome Browser"
    } else if (userAgent.includes("Firefox")) {
      device = "Firefox Browser"
    } else if (userAgent.includes("Safari")) {
      device = "Safari Browser"
    } else if (userAgent.includes("Edge")) {
      device = "Edge Browser"
    }

    return device
  }

  // Get cursor style based on current state
  getCursorStyle(): string {
    if (this.isResizing) {
      switch (this.resizeHandle) {
        case "nw":
        case "se":
          return "nw-resize"
        case "ne":
        case "sw":
          return "ne-resize"
        case "n":
        case "s":
          return "ns-resize"
        case "w":
        case "e":
          return "ew-resize"
        default:
          return "default"
      }
    } else if (this.isDragging) {
      return "move"
    } else if (this.cropArea) {
      return "move"
    }
    return "crosshair"
  }

  ngAfterViewInit(): void {
    // Add global mouse event listeners for better crop handling
    document.addEventListener("mousemove", this.onGlobalMouseMove.bind(this))
    document.addEventListener("mouseup", this.onGlobalMouseUp.bind(this))
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    document.removeEventListener("mousemove", this.onGlobalMouseMove.bind(this))
    document.removeEventListener("mouseup", this.onGlobalMouseUp.bind(this))
  }

  private onGlobalMouseMove(event: MouseEvent): void {
    if (this.showPhotoCropModal && (this.isDragging || this.isResizing)) {
      // Prevent default to avoid text selection
      event.preventDefault()
      this.updateCrop(event)
    }
  }

  private onGlobalMouseUp(event: MouseEvent): void {
    if (this.showPhotoCropModal && (this.isDragging || this.isResizing)) {
      event.preventDefault()
      this.endCrop(event)
    }
  }
}
