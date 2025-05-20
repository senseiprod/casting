import {VoixResponse, VoixService} from "../../../services/voix.service";
import {SpeakerResponse, SpeakerService} from "../../../services/speaker-service.service";
import {ActionResponse, ActionService} from "../../../services/action.service";
import {DemandeResponse, DemandeService} from "../../../services/demande-service.service";
import { Component, OnInit,  AfterViewInit,  OnDestroy } from "@angular/core"
import  { ProjectService, Project, Action } from "../../../services/project.service"
import  { ReservationService, ReservationResponse } from "../../../services/reservation.service"
import  { AuthService } from "../../../services/auth.service"
import { forkJoin, Subscription } from "rxjs"
import Chart from "chart.js/auto"

interface CalendarDay {
  number: number
  otherMonth: boolean
  hasReservation: boolean
  isToday: boolean
  date: Date
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements  OnInit, AfterViewInit, OnDestroy {
  userUuid = ""

  // Stats
  projectStats = {
    total: 0,
    active: 0,
    completed: 0,
    completionRate: 0,
  }

  actionStats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    pendingPercentage: 0,
    inProgressPercentage: 0,
    completedPercentage: 0,
    completionRate: 0,
  }

  demandeStats = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    pendingPercentage: 0,
    acceptedPercentage: 0,
    rejectedPercentage: 0,
    completionRate: 0,
  }

  reservationStats = {
    total: 0,
    upcoming: 0,
    past: 0,
    completionRate: 0,
  }

  // Data lists
  recentProjects: Project[] = []
  allActions: Action[] = []
  filteredActions: Action[] = []
  actionFilter: "all" | "pending" | "completed" = "all"
  recentDemandes: DemandeResponse[] = []
  upcomingReservations: ReservationResponse[] = []

  // Calendar
  currentDate = new Date()
  currentMonth = ""
  currentYear = 0
  weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  calendarDays: CalendarDay[] = []

  // Audio playback
  currentAudio: HTMLAudioElement | null = null
  playingActionId: string | null = null

  // Charts
  projectsChart: Chart | null = null

  // Subscriptions
  private subscriptions: Subscription[] = []

  constructor(
    private projectService: ProjectService,
    private actionService: ActionService,
    private demandeService: DemandeService,
    private reservationService: ReservationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Get user info
    this.subscriptions.push(
      this.authService.getUserConnect().subscribe((user) => {
        this.userUuid = user.uuid
        this.loadDashboardData()
      }),
    )

    // Initialize calendar
    this.updateCalendarMonth(this.currentDate)
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initProjectsChart()
    }, 500)
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe())

    // Clean up audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }

    // Clean up charts
    if (this.projectsChart) {
      this.projectsChart.destroy()
    }
  }

  loadDashboardData(): void {
    if (!this.userUuid) return

    // Use forkJoin to make parallel requests
    const projects$ = this.projectService.getAllProjects()
    const actions$ = this.actionService.getActionBySpeakerUuid(this.userUuid)
    const demandes$ = this.demandeService.getDemandesByDemandeurUuid(this.userUuid)

    // Get today's date in YYYY-MM-DD format for reservations
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    // Get date 30 days from now for upcoming reservations
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)
    const nextMonthStr = nextMonth.toISOString().split("T")[0]

    const reservations$ = this.reservationService.getReservationsByDateRange(todayStr, nextMonthStr)

    this.subscriptions.push(
      forkJoin({
        projects: projects$,
        actions: actions$,
        demandes: demandes$,
        reservations: reservations$,
      }).subscribe({
        next: (data) => {
          // Process projects
          this.processProjects(data.projects)

          // Process actions
          this.processActions(data.actions)

          // Process demandes
          this.processDemandes(data.demandes)

          // Process reservations
          this.processReservations(data.reservations)

          // Update calendar with reservations
          this.updateCalendarWithReservations(data.reservations)
        },
        error: (error) => {
          console.error("Error loading dashboard data:", error)
        },
      }),
    )
  }

  processProjects(projects: Project[]): void {
    // Filter projects for current user if needed
    const userProjects = projects // Add filter if needed

    // Calculate stats
    this.projectStats.total = userProjects.length
    this.projectStats.active = userProjects.filter((p) => !p.deleted).length
    this.projectStats.completed = userProjects.filter((p) => p.deleted).length
    this.projectStats.completionRate =
      this.projectStats.total > 0 ? (this.projectStats.completed / this.projectStats.total) * 100 : 0

    // Get recent projects (last 5)
    this.recentProjects = [...userProjects]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 5)
  }

  processActions(actions: ActionResponse[]): void {
    // Convert to Action type if needed
    this.allActions = actions as unknown as Action[]

    // Calculate stats
    this.actionStats.total = this.allActions.length
    this.actionStats.pending = this.allActions.filter((a) => a.statutAction === "EN_ATTENTE").length
    this.actionStats.inProgress = this.allActions.filter((a) => a.statutAction === "EN_COURS").length
    this.actionStats.completed = this.allActions.filter((a) => a.statutAction === "TERMINEE").length

    // Calculate percentages
    if (this.actionStats.total > 0) {
      this.actionStats.pendingPercentage = (this.actionStats.pending / this.actionStats.total) * 100
      this.actionStats.inProgressPercentage = (this.actionStats.inProgress / this.actionStats.total) * 100
      this.actionStats.completedPercentage = (this.actionStats.completed / this.actionStats.total) * 100
      this.actionStats.completionRate = (this.actionStats.completed / this.actionStats.total) * 100
    }

    // Apply initial filter
    this.filterActions("all")
  }

  processDemandes(demandes: DemandeResponse[]): void {
    // Calculate stats
    this.demandeStats.total = demandes.length
    this.demandeStats.pending = demandes.filter((d) => d.statut === "EN_ATTENTE").length
    this.demandeStats.accepted = demandes.filter((d) => d.statut === "ACCEPTEE").length
    this.demandeStats.rejected = demandes.filter((d) => d.statut === "REFUSEE").length

    // Calculate percentages
    if (this.demandeStats.total > 0) {
      this.demandeStats.pendingPercentage = (this.demandeStats.pending / this.demandeStats.total) * 100
      this.demandeStats.acceptedPercentage = (this.demandeStats.accepted / this.demandeStats.total) * 100
      this.demandeStats.rejectedPercentage = (this.demandeStats.rejected / this.demandeStats.total) * 100
      this.demandeStats.completionRate =
        ((this.demandeStats.accepted + this.demandeStats.rejected) / this.demandeStats.total) * 100
    }

    // Get recent demandes (last 5)
    this.recentDemandes = [...demandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 5)
  }

  processReservations(reservations: ReservationResponse[]): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate stats
    this.reservationStats.total = reservations.length
    this.reservationStats.upcoming = reservations.filter((r) => new Date(r.date) >= today).length
    this.reservationStats.past = reservations.filter((r) => new Date(r.date) < today).length
    this.reservationStats.completionRate =
      this.reservationStats.total > 0 ? (this.reservationStats.past / this.reservationStats.total) * 100 : 0

    // Get upcoming reservations (next 5)
    this.upcomingReservations = [...reservations]
      .filter((r) => new Date(r.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  filterActions(filter: "all" | "pending" | "completed"): void {
    this.actionFilter = filter

    switch (filter) {
      case "pending":
        this.filteredActions = this.allActions.filter((a) => a.statutAction === "EN_ATTENTE")
        break
      case "completed":
        this.filteredActions = this.allActions.filter((a) => a.statutAction === "TERMINEE")
        break
      case "all":
      default:
        this.filteredActions = [...this.allActions]
        break
    }

    // Sort by date (newest first)
    this.filteredActions.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())

    // Limit to 5 items
    this.filteredActions = this.filteredActions.slice(0, 5)
  }

  playAudio(action: Action): void {
    // If the same audio is already playing, pause it
    if (this.playingActionId === action.uuid && this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
      this.playingActionId = null
      return
    }

    // Stop any currently playing audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
      this.playingActionId = null
    }

    // Create and play the new audio
    this.projectService.createAudioUrl(action).subscribe({
      next: (url) => {
        this.currentAudio = new Audio(url)
        this.playingActionId = action.uuid

        this.currentAudio
          .play()
          .then(() => console.log("Playing audio"))
          .catch((error) => {
            console.error("Error playing audio:", error)
            this.currentAudio = null
            this.playingActionId = null
          })

        // Reset when audio ends
        this.currentAudio.addEventListener("ended", () => {
          this.currentAudio = null
          this.playingActionId = null
        })
      },
      error: (error) => {
        console.error("Error creating audio URL:", error)
      },
    })
  }

  isPlaying(actionId: string): boolean {
    return this.playingActionId === actionId
  }

  // Calendar methods
  updateCalendarMonth(date: Date): void {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Set current month and year for display
    this.currentMonth = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(date)
    this.currentYear = year

    // Get first day of month
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    const lastDate = lastDay.getDate()

    // Get last day of previous month
    const prevMonthLastDay = new Date(year, month, 0)
    const prevMonthLastDate = prevMonthLastDay.getDate()

    // Clear calendar days
    this.calendarDays = []

    // Add days from previous month
    for (let i = firstDayOfWeek; i > 0; i--) {
      const dayNumber = prevMonthLastDate - i + 1
      const dayDate = new Date(year, month - 1, dayNumber)

      this.calendarDays.push({
        number: dayNumber,
        otherMonth: true,
        hasReservation: false,
        isToday: this.isToday(dayDate),
        date: dayDate,
      })
    }

    // Add days from current month
    const today = new Date()
    for (let i = 1; i <= lastDate; i++) {
      const dayDate = new Date(year, month, i)

      this.calendarDays.push({
        number: i,
        otherMonth: false,
        hasReservation: false,
        isToday: this.isToday(dayDate),
        date: dayDate,
      })
    }

    // Add days from next month
    const remainingDays = 42 - this.calendarDays.length // 6 rows x 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i)

      this.calendarDays.push({
        number: i,
        otherMonth: true,
        hasReservation: false,
        isToday: this.isToday(dayDate),
        date: dayDate,
      })
    }
  }

  isToday(date: Date): boolean {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  updateCalendarWithReservations(reservations: ReservationResponse[]): void {
    // Mark days with reservations
    this.calendarDays.forEach((day) => {
      const dayStr = day.date.toISOString().split("T")[0]
      day.hasReservation = reservations.some((r) => r.date === dayStr)
    })
  }

  previousMonth(): void {
    const newDate = new Date(this.currentYear, this.currentDate.getMonth() - 1, 1)
    this.currentDate = newDate
    this.updateCalendarMonth(newDate)

    // Reload reservations for this month
    const firstDay = new Date(this.currentYear, this.currentDate.getMonth(), 1)
    const lastDay = new Date(this.currentYear, this.currentDate.getMonth() + 1, 0)

    const firstDayStr = firstDay.toISOString().split("T")[0]
    const lastDayStr = lastDay.toISOString().split("T")[0]

    this.reservationService.getReservationsByDateRange(firstDayStr, lastDayStr).subscribe((reservations) => {
      this.updateCalendarWithReservations(reservations)
    })
  }

  nextMonth(): void {
    const newDate = new Date(this.currentYear, this.currentDate.getMonth() + 1, 1)
    this.currentDate = newDate
    this.updateCalendarMonth(newDate)

    // Reload reservations for this month
    const firstDay = new Date(this.currentYear, this.currentDate.getMonth(), 1)
    const lastDay = new Date(this.currentYear, this.currentDate.getMonth() + 1, 0)

    const firstDayStr = firstDay.toISOString().split("T")[0]
    const lastDayStr = lastDay.toISOString().split("T")[0]

    this.reservationService.getReservationsByDateRange(firstDayStr, lastDayStr).subscribe((reservations) => {
      this.updateCalendarWithReservations(reservations)
    })
  }

  selectDay(day: CalendarDay): void {
    // Navigate to day view or show reservations for this day
    if (day.hasReservation) {
      const dayStr = day.date.toISOString().split("T")[0]
      // You can navigate to a detailed view or show a modal
      console.log(`Viewing reservations for ${dayStr}`)
    }
  }

  // Chart initialization
  initProjectsChart(): void {
    const ctx = document.getElementById("projectsChart") as HTMLCanvasElement
    if (!ctx) return

    // Sample data - replace with actual data from your API
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const projectData = [5, 8, 12, 10, 15, 18, 20, 25, 22, 30, 28, 32]
    const actionData = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]

    this.projectsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Projets",
            data: projectData,
            borderColor: "#CB1025",
            backgroundColor: "rgba(203, 16, 37, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Actions",
            data: actionData,
            borderColor: "#9e0c1d",
            backgroundColor: "rgba(158, 12, 29, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }
}

