import {Component, OnInit} from '@angular/core';
interface ActivityLog {
  id: string
  timestamp: string
  date: string
  time: string
  category: "account" | "project" | "billing" | "security"
  action: string
  description: string
  ip: string
  device: string
  status: "success" | "warning" | "error"
  details?: any
}
@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {
  categoryFilter = ""
  dateRangeFilter = "all"
  searchFilter = ""
  startDate = ""
  endDate = ""
  showFilters = true

  // Date range options
  customDateRange = false

  // Stats
  activityStats = [
    {
      title: "Total Activities",
      value: 348,
      icon: "bi-activity",
      color: "primary",
      change: {
        value: "15%",
        direction: "up",
      },
    },
    {
      title: "Projects",
      value: 142,
      icon: "bi-folder",
      color: "info",
      change: {
        value: "8%",
        direction: "up",
      },
    },
    {
      title: "Security Events",
      value: 78,
      icon: "bi-shield-check",
      color: "success",
      change: {
        value: "12%",
        direction: "down",
      },
    },
    {
      title: "Account Activity",
      value: 128,
      icon: "bi-person",
      color: "warning",
      change: {
        value: "18%",
        direction: "up",
      },
    },
  ]

  // Activity log data
  activityLogs: ActivityLog[] = [
    {
      id: "act-10042",
      timestamp: "2023-04-16T10:45:00",
      date: "Apr 16, 2023",
      time: "10:45 AM",
      category: "account",
      action: "Account Login",
      description: "Successful login to account",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10041",
      timestamp: "2023-04-16T09:30:00",
      date: "Apr 16, 2023",
      time: "09:30 AM",
      category: "account",
      action: "Profile Update",
      description: "Profile information was updated",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10040",
      timestamp: "2023-04-15T15:20:00",
      date: "Apr 15, 2023",
      time: "03:20 PM",
      category: "billing",
      action: "Payment Received",
      description: "Payment received for Invoice #INV-2023-042",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10039",
      timestamp: "2023-04-15T14:15:00",
      date: "Apr 15, 2023",
      time: "02:15 PM",
      category: "project",
      action: "Project Completed",
      description: "Completed Commercial Voiceover for Acme Corporation",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10038",
      timestamp: "2023-04-12T11:20:00",
      date: "Apr 12, 2023",
      time: "11:20 AM",
      category: "project",
      action: "Project Started",
      description: "Started working on Commercial Voiceover for Acme Corporation",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10037",
      timestamp: "2023-04-10T15:30:00",
      date: "Apr 10, 2023",
      time: "03:30 PM",
      category: "billing",
      action: "Withdrawal",
      description: "Withdrew $2,000 to bank account",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10036",
      timestamp: "2023-04-08T09:15:00",
      date: "Apr 08, 2023",
      time: "09:15 AM",
      category: "security",
      action: "Password Changed",
      description: "Password was successfully changed",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
    {
      id: "act-10035",
      timestamp: "2023-04-05T16:45:00",
      date: "Apr 05, 2023",
      time: "04:45 PM",
      category: "security",
      action: "Failed Login Attempt",
      description: "Failed login attempt detected",
      ip: "203.0.113.1",
      device: "Unknown Device",
      status: "error",
    },
    {
      id: "act-10034",
      timestamp: "2023-04-02T11:30:00",
      date: "Apr 02, 2023",
      time: "11:30 AM",
      category: "account",
      action: "Email Changed",
      description: "Email address was updated",
      ip: "192.168.1.2",
      device: "iPhone 13 - Safari",
      status: "warning",
    },
    {
      id: "act-10033",
      timestamp: "2023-03-28T13:20:00",
      date: "Mar 28, 2023",
      time: "01:20 PM",
      category: "project",
      action: "Project Feedback",
      description: "Received feedback for E-Learning Narration",
      ip: "192.168.1.1",
      device: "MacBook Pro - Chrome",
      status: "success",
    },
  ]

  // Selected log for details view
  selectedLog: ActivityLog | null = null

  constructor() {}

  ngOnInit(): void {}

  // Toggle filters visibility
  toggleFilters(): void {
    this.showFilters = !this.showFilters
  }

  // Reset filters
  resetFilters(): void {
    this.categoryFilter = ""
    this.dateRangeFilter = "all"
    this.searchFilter = ""
    this.startDate = ""
    this.endDate = ""
    this.customDateRange = false
  }

  // Apply filters
  applyFilters(): void {
    console.log("Applying filters...")
    // In a real application, this would filter the data
  }

  // View log details
  viewLogDetails(log: ActivityLog): void {
    this.selectedLog = log
    // In a real app, you might show a modal or navigate to a detail page
  }

  // Export logs
  exportLogs(): void {
    console.log("Exporting logs...")
    // In a real application, this would export the logs to CSV or PDF
  }

  // Handle date range change
  onDateRangeChange(): void {
    this.customDateRange = this.dateRangeFilter === "custom"
  }

  // Get CSS class based on log status
  getStatusClass(status: string): string {
    switch (status) {
      case "success":
        return "text-success"
      case "warning":
        return "text-warning"
      case "error":
        return "text-danger"
      default:
        return ""
    }
  }

  // Get icon based on category
  getCategoryIcon(category: string): string {
    switch (category) {
      case "account":
        return "bi-person"
      case "project":
        return "bi-folder"
      case "billing":
        return "bi-credit-card"
      case "security":
        return "bi-shield"
      default:
        return "bi-activity"
    }
  }

  // Get CSS class based on category
  getCategoryClass(category: string): string {
    switch (category) {
      case "account":
        return "category-account"
      case "project":
        return "category-project"
      case "billing":
        return "category-billing"
      case "security":
        return "category-security"
      default:
        return ""
    }
  }
}
