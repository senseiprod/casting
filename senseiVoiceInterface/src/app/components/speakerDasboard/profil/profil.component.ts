import { Component, OnInit } from '@angular/core';
import { UtilisateurService, UtilisateurRequest, ChangePasswordRequest } from "../../../services/utilisateur-service.service";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from 'src/app/services/client-service.service';
import { AuthService } from 'src/app/services/auth.service';

interface NotificationSetting {
  id: string;
  type: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface SecurityLog {
  id: string;
  activity: string;
  device: string;
  location: string;
  ip: string;
  date: string;
  time: string;
  icon: string;
}

interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  connectedDate: string;
  permissions: string[];
}

interface BillingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

    // Password change form with validation
    passwordForm = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  
    // Password validation states
    passwordValidation = {
      currentPasswordError: "",
      newPasswordError: "",
      confirmPasswordError: "",
      generalError: "",
      successMessage: ""
    };
  // Active tab
  activeTab = "general";
  // Show delete account form
  showDeleteAccountForm = false
  // User data
  currentUser: UtilisateurRequest | null = null;
  userPhotoUrl: SafeUrl | null = null;
  selectedPhotoFile: File | null = null;

  // Loading states
  isLoadingPhoto = false;
  isUpdatingProfile = false;
  isUploadingPhoto = false;

  // General settings
  generalSettings = {
    language: "english",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    autoSave: true,
    darkMode: false,
  };

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
  };

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
  ];

  // Privacy settings
  privacySettings = {
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowReviews: true,
    allowTestimonials: true,
    dataSharing: false,
  };

  // Security settings
  securitySettings = {
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: "30m",
    passwordExpiry: "90d",
  };


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
  ];

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
  ];

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
  ];

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
  ];
  userId: string;
  isChangingPassword = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private clientService : ClientService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
      if (this.userId) {
        this.loadUserProfile();
        this.loadUserPhoto();
      }
    })
    this.clientService.getClientByUuid(this.userId).subscribe({
      next: (client) => {
        if (client) {
          this.accountSettings.firstName = client.prenom;
          this.accountSettings.lastName = client.nom;
          this.accountSettings.email = client.email;
          this.accountSettings.phone = client.phone;
          this.mapAccountSettingsToUser();
        }
      },
      error: (error) => {
        console.error('Error loading client data:', error);
      }
    });


  }

  // Load user profile data
  loadUserProfile(): void {
    const userId = this.userId;
    if (userId) {
      this.mapAccountSettingsToUser();
    }
  }

  // Load user photo
  loadUserPhoto(): void {
    if (this.userId) {
      this.isLoadingPhoto = true;
      this.utilisateurService.getPhoto(this.userId).subscribe({
        next: (photoBlob: Blob) => {
          const objectURL = URL.createObjectURL(photoBlob);
          this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.isLoadingPhoto = false;
        },
        error: (error) => {
          console.error('Error loading photo:', error);
          this.isLoadingPhoto = false;
        }
      });
    }
  }

  // Handle photo file selection
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhotoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Upload photo
  uploadPhoto(): void {
    if (this.selectedPhotoFile) {
      const userId = this.getCurrentUserId();
      if (this.userId) {
        this.isUploadingPhoto = true;
        this.utilisateurService.uploadPhoto(this.userId, this.selectedPhotoFile).subscribe({
          next: (response) => {
            console.log('Photo uploaded successfully:', response);
            this.isUploadingPhoto = false;
            this.selectedPhotoFile = null;
            this.loadUserPhoto();
          },
          error: (error) => {
            console.error('Error uploading photo:', error);
            this.isUploadingPhoto = false;
          }
        });
      }
    }
  }

  // Update user profile
  updateUserProfile(): void {
    if (this.currentUser) {
      this.isUpdatingProfile = true;
      this.utilisateurService.updateUtilisateur(this.userId, this.currentUser).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.isUpdatingProfile = false;
          this.mapUserToAccountSettings();
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.isUpdatingProfile = false;
        }
      });
    }
  }

  // Map account settings to user object
  private mapAccountSettingsToUser(): void {
    this.currentUser = {
      id: 0,
      code: '',
      nom: this.accountSettings.lastName,
      prenom: this.accountSettings.firstName,
      email: this.accountSettings.email,
      motDePasse: '',
      role : "CLIENT",
      phone: this.accountSettings.phone,
      deleted: false,
      verified: true,
      balance: 0,
      fidelity: 0
    };
  }

  // Map user object back to account settings
  private mapUserToAccountSettings(): void {
    if (this.currentUser) {
      this.accountSettings.firstName = this.currentUser.prenom;
      this.accountSettings.lastName = this.currentUser.nom;
      this.accountSettings.email = this.currentUser.email;
      this.accountSettings.phone = this.currentUser.phone;
    }
  }

  // Get current user ID
  private getCurrentUserId(): string | null {
    return "1"; // Placeholder - replace with actual implementation
  }

  // Set active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Update general settings
  updateGeneralSettings(): void {
    console.log("Updating general settings:", this.generalSettings);
    // Implement update logic
  }

  // Update account settings
  updateAccountSettings(): void {
    this.mapAccountSettingsToUser();
    this.updateUserProfile();
  }

  // Update notification settings
  updateNotificationSettings(): void {
    console.log("Updating notification settings:", this.notificationSettings);
    // Implement update logic
  }

  // Update privacy settings
  updatePrivacySettings(): void {
    console.log("Updating privacy settings:", this.privacySettings);
    // Implement update logic
  }

  // Update security settings
  updateSecuritySettings(): void {
    console.log("Updating security settings:", this.securitySettings);
    // Implement update logic
  }

  // Change password


  // Disconnect app
  disconnectApp(appId: string): void {
    console.log("Disconnecting app:", appId);
    // Implement disconnect logic
  }

  // Change plan
  changePlan(planId: string): void {
    console.log("Changing to plan:", planId);
    // Implement plan change logic
  }

  // Download invoice
  downloadInvoice(invoiceId: string): void {
    console.log("Downloading invoice:", invoiceId);
    // Implement download logic
  }

  // Toggle two-factor authentication
  toggleTwoFactorAuth(): void {
    this.securitySettings.twoFactorAuth = !this.securitySettings.twoFactorAuth;
    console.log("Two-factor authentication:", this.securitySettings.twoFactorAuth ? "Enabled" : "Disabled");
    // Implement toggle logic
  }

  // Delete account - show form instead of confirmation
  deleteAccount(): void {
    this.showDeleteAccountForm = true;
  }

  // Cancel account deletion
  cancelDeleteAccount(): void {
    this.showDeleteAccountForm = false;
  }

  // Process account deletion request
  processDeleteAccountRequest(formData: any): void {
    console.log("Processing account deletion request:", formData);
    setTimeout(() => {
      alert("Your account deletion request has been submitted. You will receive a confirmation email shortly.");
      this.showDeleteAccountForm = false;
    }, 1500);
  }

    // Validate password form
    validatePasswordForm(): boolean {
      this.clearPasswordValidation();
      let isValid = true;
  
      // Validate current password
      if (!this.passwordForm.currentPassword.trim()) {
        this.passwordValidation.currentPasswordError = "Current password is required";
        isValid = false;
      }
  
      // Validate new password
      if (!this.passwordForm.newPassword.trim()) {
        this.passwordValidation.newPasswordError = "New password is required";
        isValid = false;
      } else if (this.passwordForm.newPassword.length < 8) {
        this.passwordValidation.newPasswordError = "New password must be at least 8 characters long";
        isValid = false;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.passwordForm.newPassword)) {
        this.passwordValidation.newPasswordError = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        isValid = false;
      }
  
      // Validate confirm password
      if (!this.passwordForm.confirmPassword.trim()) {
        this.passwordValidation.confirmPasswordError = "Please confirm your new password";
        isValid = false;
      } else if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordValidation.confirmPasswordError = "Passwords do not match";
        isValid = false;
      }
  
      // Check if new password is different from current password
      if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
        this.passwordValidation.newPasswordError = "New password must be different from current password";
        isValid = false;
      }
  
      return isValid;
    }
  
    // Clear password validation messages
    clearPasswordValidation(): void {
      this.passwordValidation = {
        currentPasswordError: "",
        newPasswordError: "",
        confirmPasswordError: "",
        generalError: "",
        successMessage: ""
      };
    }
  
    // Change password
    changePassword(): void {
      if (!this.validatePasswordForm()) {
        return;
      }
  
      this.isChangingPassword = true;
      this.clearPasswordValidation();
  
      const changePasswordRequest: ChangePasswordRequest = {
        email: this.accountSettings.email,
        oldPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword
      };
  
      this.authService.changePassword(changePasswordRequest).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.isChangingPassword = false;
          this.passwordValidation.successMessage = "Password changed successfully!";
          
          // Clear the form
          this.passwordForm = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          };
  
          // Add security log entry
          this.addSecurityLogEntry("Password Changed");
  
          // Auto-clear success message after 5 seconds
          setTimeout(() => {
            this.passwordValidation.successMessage = "";
          }, 5000);
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.isChangingPassword = false;
          
          // Handle specific error messages
          if (error.status === 400) {
            this.passwordValidation.currentPasswordError = "Current password is incorrect";
          } else if (error.status === 404) {
            this.passwordValidation.generalError = "User not found";
          } else if (error.status === 422) {
            this.passwordValidation.generalError = "Invalid password format";
          } else {
            this.passwordValidation.generalError = "An error occurred while changing password. Please try again.";
          }
        }
      });
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
      icon: "bi-key"
    };

    this.securityLogs.unshift(newLog);
    
    // Keep only the last 10 entries
    if (this.securityLogs.length > 10) {
      this.securityLogs = this.securityLogs.slice(0, 10);
    }
  }

  // Get current device info
  private getCurrentDevice(): string {
    const userAgent = navigator.userAgent;
    let device = "Unknown Device";
    
    if (userAgent.includes("Chrome")) {
      device = "Chrome Browser";
    } else if (userAgent.includes("Firefox")) {
      device = "Firefox Browser";
    } else if (userAgent.includes("Safari")) {
      device = "Safari Browser";
    } else if (userAgent.includes("Edge")) {
      device = "Edge Browser";
    }
    
    return device;
  }
}