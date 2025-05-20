import { Component } from '@angular/core';
import {UtilisateurService} from "../../../services/utilisateur-service.service";
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
@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {
  // Active tab
  activeTab = "general"

  // Show delete account form
  showDeleteAccountForm = false;

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

  // Password change
  passwordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  constructor() {}

  ngOnInit(): void {}

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
    console.log("Updating account settings:", this.accountSettings)
    // Implement update logic
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

  // Change password
  changePassword(): void {
    console.log("Changing password:", this.passwordForm)
    // Implement password change logic
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
    this.showDeleteAccountForm = true;
  }

  // Cancel account deletion
  cancelDeleteAccount(): void {
    this.showDeleteAccountForm = false;
  }

  // Process account deletion request
  processDeleteAccountRequest(formData: any): void {
    console.log("Processing account deletion request:", formData);
    // Here you would implement the API call to submit the deletion request

    // For demo purposes, we'll just log the data and show a success message
    setTimeout(() => {
      alert("Your account deletion request has been submitted. You will receive a confirmation email shortly.");
      this.showDeleteAccountForm = false;
    }, 1500);
  }
}
