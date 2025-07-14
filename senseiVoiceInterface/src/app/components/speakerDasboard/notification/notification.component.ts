import { Component,  OnInit,  OnDestroy, Input, Output, EventEmitter } from "@angular/core"
import  { NotificationService, NotificationResponse } from "../../../services/notification.service"
import {  Subscription, interval } from "rxjs"
import { ActivatedRoute } from "@angular/router"

export interface NotificationFilter {
  type?: string
  status?: "read" | "unread" | "all"
  dateRange?: number // hours
}

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.css"],
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() autoRefresh = true
  @Input() refreshInterval = 30000 // 30 seconds
  @Input() pageSize = 20
  @Input() showFilters = true
  @Input() showPagination = true
  @Input() compact = false

  @Output() notificationClick = new EventEmitter<NotificationResponse>()
  @Output() notificationCountChange = new EventEmitter<number>()

  // Notification data
  notifications: NotificationResponse[] = []
  totalNotifications = 0
  unreadCount = 0
  currentPage = 0
  userUuid : string = ""

  // Loading states
  isLoading = false
  isLoadingMore = false
  isMarkingAsRead = false
  isDeleting = false

  // Error handling
  error: string | null = null

  // Filters
  currentFilter: NotificationFilter = { status: "all" }
  availableTypes: string[] = []

  // Subscriptions
  private refreshSubscription?: Subscription
  private notificationSubscription?: Subscription

  constructor(private notificationService: NotificationService,
    private route: ActivatedRoute,

  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userUuid = params.get("uuid") || ""
      if (this.userUuid) {
        this.loadNotifications()
      }
    })
    this.loadUnreadCount()

    if (this.autoRefresh) {
      this.startAutoRefresh()
    }
  }

  ngOnDestroy() {
    this.cleanup()
  }

  private cleanup() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe()
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe()
    }
  }

  private startAutoRefresh() {
    this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
      this.refreshNotifications()
    })
  }

  loadNotifications(reset = true) {
    if (reset) {
      this.currentPage = 0
      this.notifications = []
    }

    this.isLoading = reset
    this.isLoadingMore = !reset
    this.error = null

    const { type, status } = this.currentFilter

    this.notificationSubscription = this.notificationService
      .getFilteredNotifications(
        this.userUuid,
        type,
        status === "all" ? undefined : status,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (response) => {
          const newNotifications = Array.isArray(response) ? response : response.content || []

          if (reset) {
            this.notifications = newNotifications
          } else {
            this.notifications = [...this.notifications, ...newNotifications]
          }

          this.totalNotifications = response.totalElements || this.notifications.length
          this.extractAvailableTypes()
          this.isLoading = false
          this.isLoadingMore = false
        },
        error: (error) => {
          console.error("Error loading notifications:", error)
          this.error = "Failed to load notifications"
          this.isLoading = false
          this.isLoadingMore = false
        },
      })
  }

  private loadUnreadCount() {
    this.notificationService.getUnreadCount(this.userUuid).subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount
        this.notificationCountChange.emit(this.unreadCount)
      },
      error: (error) => {
        console.error("Error loading unread count:", error)
        // Fallback: count manually
        this.unreadCount = this.notifications.filter((n) => !n.readAt).length
        this.notificationCountChange.emit(this.unreadCount)
      },
    })
  }

  private extractAvailableTypes() {
    const types = new Set(this.notifications.map((n) => n.type))
    this.availableTypes = Array.from(types).sort()
  }

  refreshNotifications() {
    this.loadNotifications(true)
    this.loadUnreadCount()
  }

  loadMore() {
    if (this.isLoadingMore || this.notifications.length >= this.totalNotifications) {
      return
    }

    this.currentPage++
    this.loadNotifications(false)
  }

  applyFilter(filter: NotificationFilter) {
    this.currentFilter = { ...this.currentFilter, ...filter }
    this.loadNotifications(true)
  }

  clearFilters() {
    this.currentFilter = { status: "all" }
    this.loadNotifications(true)
  }

  markAsRead(notification: NotificationResponse) {
    if (notification.readAt) return

    this.isMarkingAsRead = true

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.readAt = new Date().toISOString()
        this.unreadCount = Math.max(0, this.unreadCount - 1)
        this.notificationCountChange.emit(this.unreadCount)
        this.isMarkingAsRead = false
      },
      error: (error) => {
        console.error("Error marking notification as read:", error)
        this.error = "Failed to mark notification as read"
        this.isMarkingAsRead = false
      },
    })
  }

  markAllAsRead() {
    if (this.unreadCount === 0) return

    this.isMarkingAsRead = true

    this.notificationService.markAllAsRead(this.userUuid).subscribe({
      next: () => {
        this.notifications.forEach((n) => {
          if (!n.readAt) {
            n.readAt = new Date().toISOString()
          }
        })
        this.unreadCount = 0
        this.notificationCountChange.emit(this.unreadCount)
        this.isMarkingAsRead = false
      },
      error: (error) => {
        console.error("Error marking all notifications as read:", error)
        this.error = "Failed to mark all notifications as read"
        this.isMarkingAsRead = false
      },
    })
  }

  deleteNotification(notification: NotificationResponse) {
    this.isDeleting = true

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        const index = this.notifications.findIndex((n) => n.id === notification.id)
        if (index > -1) {
          const wasUnread = !this.notifications[index].readAt
          this.notifications.splice(index, 1)
          this.totalNotifications--

          if (wasUnread) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
            this.notificationCountChange.emit(this.unreadCount)
          }
        }
        this.isDeleting = false
      },
      error: (error) => {
        console.error("Error deleting notification:", error)
        this.error = "Failed to delete notification"
        this.isDeleting = false
      },
    })
  }

  handleNotificationClick(notification: NotificationResponse) {
    this.markAsRead(notification)
    this.notificationClick.emit(notification)
  }

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

  formatNotificationTime(createdAt: string): string {
    const now = new Date()
    const notificationTime = new Date(createdAt)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
  }

  trackNotificationById(index: number, notification: NotificationResponse): number {
    return notification.id || index
  }

  get hasMoreNotifications(): boolean {
    return this.notifications.length < this.totalNotifications
  }

  get filteredNotificationsCount(): number {
    return this.notifications.length
  }
}
